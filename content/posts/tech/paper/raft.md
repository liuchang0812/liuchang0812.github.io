---
title: "Raft 算法笔记"
date: 2025-05-14T22:44:51+08:00
lastmod: 2025-05-14T22:44:51+08:00
author: ["Chang Liu"]
tags: 
- paxos
- tech
- paper
summary: "Raft 算法是怎么回事"
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: ""
draft: true # 是否为草稿
comments: true
showToc: true # 显示目录
TocOpen: true # 自动展开目录
hidemeta:  true # 是否隐藏文章的元信息，如发布日期、作者等
disableShare: true # 底部不显示分享栏
showbreadcrumbs: true #顶部显示当前路径
---

Paxos 算法是个优雅的算法，但是不太容易理解，论文也没有提供工程实现的具体方法。Raft 算法则是一个设计目标就是易于理解，并提供详细工程实现参考的一致性算法。

为了易于理解，作者希望尽量把算法解耦拆分为几个小块，每个小块都易于理解，块与块之间没有耦合。在这个目的之下，算法被分为几个部分：

- 选主流程
- 日志推送
- 给选主和日志推送打补丁
- 增加成员变更和快照并继续打补丁

所以，我个人觉得 raft 没有 paxos 优雅简单。paxos 是看着很复杂，但是没有太多细节补丁，数学上很优美。raft 则是看着很清晰简单，但是上面打了很多补丁细节。

首先对于第一个部分选主，因为还没有第二部分日志的概念，所以很难一步描述正确，只能先说个大概。每个成员有个随机的超时时间，如果超时了就发起投票请求来抢主，其它成员在每个 term 只会投票给一个人。

然后对于第二个部分，介绍了 raft 采用完全由 leader 向 follower 推送日志的机制。leader 会维护每个成员当前推送到哪个日志位置，如果大多数日志被其它成员确认接收到，就移动 commmit 指针到这个日志。

然后第三部分就来了，上述的描述其实是有问题的，需要打补丁：补丁 1 是抢主请求投票的时候要带上自己最新日志的信息，其它成员投票给有最新日志的成员。补丁 2 是推送日志的时候只推送自己当 leader 的 term 内的日志。

