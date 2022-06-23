---
title: "Why Does Conv Need a Mutex"
date: 2022-06-23T17:29:52+08:00
lastmod: 2022-06-23T17:29:52+08:00
author: ["Chang Liu"]
categories: 
- os
- lock
tags: 
- os
description: "为什么信号量还需要一个互斥锁保护？"
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: ""
draft: false # 是否为草稿
comments: true
showToc: true # 显示目录
TocOpen: true # 自动展开目录
hidemeta: false # 是否隐藏文章的元信息，如发布日期、作者等
disableShare: true # 底部不显示分享栏
showbreadcrumbs: true #顶部显示当前路径
cover:
    image: ""
    caption: ""
    alt: ""
    relative: false
---

> 我们以 `C++11` 的 API 接口定义来描述

大家在编写多线程类的程序时，会用到信号量 [condition_variable](https://en.cppreference.com/w/cpp/thread/condition_variable)，有没有疑惑过为什么 cv 这类接口，在调用 `wait/notify` 时候还需要用一个 `mutex`。

## 为什么  `cv.wait()` 需要用 `mutex` 保护？

常见的 `cv` 代码实现类似下方，包含三个部分：检查条件是否满足；如果不满足等待到满足；等待到满足后执行逻辑。

```cpp
std::unique_lock<std::mutex> lock(cv_m);
while (!cond_ok()) {  // 1. 检查条件是否满足
    wait(lock);            // 2. 等待信号
}
// do somethings with cond // 3. 执行逻辑
```

如果没有一个锁保护这三个部分，会出现两种情况：

1. 在第一部分检查条件不满足，准备进行第二部分 `wait`信号时，另一个线程达到了信号条件并 `signal` ，然后执行到 `wait` 。这个时候 `wiat` 就永远挂在这儿了。
2. 在第二部分执行完成后，认为已经达到条件，准备执行第三部分的业务逻辑。另一个线程修改了条件。第三部分执行的假设是条件已经满足，违反了假设，业务逻辑可能会有问题。

所以一般会通过一个 mutex 将上述三个部分看起一个原子操作，将检查条件是否完成与等待信号量同时执行。其它线程如果 signal 信号，一定是在检查条件之前或者wait之后。

# 附录

1. [lock-and-condition-variable](https://www.chromium.org/developers/lock-and-condition-variable)
2. [cppreference](https://en.cppreference.com/w/cpp/thread/condition_variable/wait)