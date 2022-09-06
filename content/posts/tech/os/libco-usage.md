---
title: "libco usage"
date: 2022-09-06T21:00:54+08:00
lastmod: 2022-09-06T21:00:54+08:00
author: ["Chang Liu"]
categories: 
- os
- libco
tags: 
- os
- libco
description: "this note shares libco coroutine usage"
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: ""
draft: false # 是否为草稿
comments: true
showToc: true # 显示目录
TocOpen: true # 自动展开目录
hidemeta: false # 是否隐藏文章的元信息，如发布日期、作者等
disableShare: true # 底部不显示分享栏
showbreadcrumbs: true #顶部显示当前路径
---

libco 协程，被分类到非对称协程。分类的方法是：

- 对称协程（典型的如 golang 的 goroutine），一个协程 yield 后，执行机会不会直接返还到调用者，而是调度器来决定唤起哪个协程。
- 非对称协程（例如 libco ），一个协程 yield 后，会返还到调用者，继续执行调用者的函数。

> 非对称在于程序控制流转移到被调协程时使用的是 call/resume 操作，而当被调协程让出 CPU 时使用的却是 return/yield 操作。此外，协程间的地位也不对等，caller 与 callee 关系是确定的，不可更改的，非对称协程只能返回最初调用它的协程。

[https://zhuanlan.zhihu.com/p/51078499](https://zhuanlan.zhihu.com/p/51078499)
> 

在 libco 的实现中，每个线程会有一个 stack 来维护当前的协程列表，调用 `co_resume` 则会压入一个协程，调用 `co_yield` 则会弹出一个协程（实现的实现上只是栈顶指针的加减）。

所以，在实际使用过程中，如果涉及到复杂场景，需要用到 `co_yield` 来自己调度 `libco` 的协程。那么怎么来实现呢，有没有什么套路。我们可以参考这个[自带例子](https://github.com/Tencent/libco/blob/master/example_echosvr.cpp)来学习一下。

因为需要自己调度协程，所以一般要把协程指针和协和对应的任务信息封装到一个结构体中，同时使用一个 `stack/queue` 保存所有的协程（因为一个协程 yield 之后就找不到了，没办法自动继续执行）。

```cpp
struct task_t                           // 一个任务结构体
{
	stCoRoutine_t *co;                    // 对应的协程指针
	int fd;                               // 协程负责任务的参数
};
static stack<task_t*> g_readwrite;      // 开一个全局变量来保存所有的任务
```

为了方便理解，可以先忽略例子中的多进程部分代码。代码先创建了若干个 `readwrite_routine`协程

```cpp
for(int i=0;i<cnt;i++)
{
	task_t * task = (task_t*)calloc( 1,sizeof(task_t) );
	task->fd = -1;                      // 特殊值
  co_create( &(task->co),NULL,readwrite_routine,task );
	co_resume( task->co );              // 压到 stack 中开始执行，跳转到下面的函数
}

static void *readwrite_routine( void *arg )
{

	co_enable_hook_sys();                    //  hook read/write 等io调用走协程实现               

	task_t *co = (task_t*)arg;
	char buf[ 1024 * 16 ];
	for(;;)
	{
		if( -1 == co->fd )                    // 第一次进来是 -1 特殊值，将 task 保存到 g_readwrite
		{
			g_readwrite.push( co );
			co_yield_ct();                      // 让出 cpu 到调用者，也就是主线程，继续创建协程。
		}                                     // 然后会进入到 accept_routine continue;

		int fd = co->fd;                      // 从 accept_routine 切换回来，这个时候 fd 有值了
		co->fd = -1;                          // 标记为特殊值，下次循环会 yield 出去

		for(;;)
		{                                     // 任务逻辑
			struct pollfd pf = { 0 };
			pf.fd = fd;
			pf.events = (POLLIN|POLLERR|POLLHUP);
			co_poll( co_get_epoll_ct(),&pf,1,1000);

			int ret = read( fd,buf,sizeof(buf) );
			if( ret > 0 )
			{
				ret = write( fd,buf,ret );
			}
			if( ret > 0 || ( -1 == ret && EAGAIN == errno ) )
			{
				continue;
			}
			close( fd );
			break;
		}

	}
	return 0;
}

static void *accept_routine( void * )
{
	co_enable_hook_sys();

	for(;;)
	{
		if( g_readwrite.empty() )           // g_readwrite 为空时，等待1s
		{
			struct pollfd pf = { 0 };
			pf.fd = -1;
			poll( &pf,1,1000);
			continue;
		}                                

		struct sockaddr_in addr; //maybe sockaddr_un;
		memset( &addr,0,sizeof(addr) );
		socklen_t len = sizeof(addr);

		int fd = co_accept(g_listen_fd, (struct sockaddr *)&addr, &len);
		if( fd < 0 )
		{
			struct pollfd pf = { 0 };
			pf.fd = g_listen_fd;
			pf.events = (POLLIN|POLLERR|POLLHUP);
			co_poll( co_get_epoll_ct(),&pf,1,1000 );           // co_accept/co_poll注册回调，在有数据的时候swap回来，然后让出 cpu，执行 co_eventloop 
			continue;
		}
		if( g_readwrite.empty() )      // double check
		{
			close( fd );
			continue;
		}
		SetNonBlock( fd );
		task_t *co = g_readwrite.top();  // 取一个协程，分配这个 accept 的 fd
		co->fd = fd;
		g_readwrite.pop();
		co_resume( co->co );              // 切换到改协程，继续执行 readwrite_routine
	}
	return 0;
}
```

## 总结一下

使用 libco 自己调度协程的实现模块有：

- 用一个全局队列保存所有的任务执行协程；
- 使用 task 结构体保存协程指针和任务参数；
- 任务执行协程初始化后压到协程队列，让出 cpu 给调用者；
- 任务分发协程在没有可用协程时（协程队列为空），等待任务协程空闲。有任务时，更新任务参数后唤醒执行协程。