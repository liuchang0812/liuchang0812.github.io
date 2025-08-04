---
title: "通过 leveldb 学习批量请求优化"
date: 2025-08-04T23:16:34+08:00
lastmod: 2025-08-04T23:16:34+08:00
author: ["Chang Liu"]
tags: 
- leveldb
summary: "学习如何通过批量化的方式优化我们的系统"
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: ""
draft: false # 是否为草稿
comments: true
showToc: true # 显示目录
TocOpen: true # 自动展开目录
hidemeta:   false # 是否隐藏文章的元信息，如发布日期、作者等
disableShare: true # 底部不显示分享栏
showbreadcrumbs: true #顶部显示当前路径
---


## 背景

Lsm 存储引擎的写入流程为：先写 wal 日志，再更新内存中的 skiplist。在典型的场景下，可能会有很多线程并发的写入数据，如何提供高性能的写操作呢？

## Leveldb 批量写入的优化

代码逻辑在 `Status DBImpl::Write(const WriteOptions& options, WriteBatch* updates) ` 中。

考虑最朴素的实现方法：每个线程的写请求来了之后排队抢锁，抢到锁的线程开始后续的写日志更新内存的操作，完成之后释放锁。可以预见这种方式相当于写操作完全串行而且会有大量的小 io，性能会很一般。

Leveldb 中采用了批量化写入的实现：请示到达之后会封装为一个 writer 结构体中，然后加到队列中。当线程不是 leader 的时候，就通过 condvar 等待唤醒，当线程是 leader 的时候（任务在最前面），就打包队列中的多个 请求作为了一个整体的请示写 wal 日志。写日志的时候会释放锁，让其它线程的写请示继续添加到任务队列中。写操作成功后，leader 会依次把这批任务的状态更新为完成并唤醒对应的 condvar，最后唤醒当前任务队列的 leader 结点让它开始处理下一批任务。

```cpp
Status DBImpl::Write(const WriteOptions& options, WriteBatch* updates) {
  Writer w(&mutex_);
  w.batch = updates;
  w.sync = options.sync;
  w.done = false;

  MutexLock l(&mutex_);
  writers_.push_back(&w);
  while (!w.done && &w != writers_.front()) {
    w.cv.Wait();
  }
  if (w.done) {
    return w.status;
  }

  // May temporarily unlock and wait.
  Status status = MakeRoomForWrite(updates == nullptr);
  uint64_t last_sequence = versions_->LastSequence();
  Writer* last_writer = &w;
  if (status.ok() && updates != nullptr) {  // nullptr batch is for compactions
    WriteBatch* write_batch = BuildBatchGroup(&last_writer);
    // BuildBatchGroup 负责选择本批打包哪些任务，last_writer 指向本组最后一个任务
    WriteBatchInternal::SetSequence(write_batch, last_sequence + 1);
    last_sequence += WriteBatchInternal::Count(write_batch);

    {
      mutex_.Unlock();
      status = log_->AddRecord(WriteBatchInternal::Contents(write_batch));
      bool sync_error = false;
      if (status.ok() && options.sync) {
        status = logfile_->Sync();
        if (!status.ok()) {
          sync_error = true;
        }
      }
      if (status.ok()) {
        status = WriteBatchInternal::InsertInto(write_batch, mem_);
      }
      mutex_.Lock();
    }
    if (write_batch == tmp_batch_) tmp_batch_->Clear();

    versions_->SetLastSequence(last_sequence);
  }

  while (true) {
    Writer* ready = writers_.front();
    writers_.pop_front();
    if (ready != &w) {
      ready->status = status;
      ready->done = true;
      ready->cv.Signal();
    }
    if (ready == last_writer) break;
  }

  // Notify new head of write queue
  if (!writers_.empty()) {
    writers_.front()->cv.Signal();
  }

  return status;
}
```

