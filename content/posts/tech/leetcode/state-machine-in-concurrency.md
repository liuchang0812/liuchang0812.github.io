---
title: "并发编程中的状态机"
date: 2024-08-15T23:34:58+08:00
date: 2024-08-15T23:34:58+08:00
author: ["Chang Liu"]
categories: 
- leetcode
- cpp
tags: 
- cpp
- leetcode
description: "使用状态机思路解决一个并行问题"
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

使用状态机思路解决一个并行[问题](https://leetcode.cn/problems/building-h2o)。

题目可以描述为：进程A每轮循环产生一个 H，进程 B 每轮循环产生一个 O，需要保证每产生 3 个元素时都由 2 个 H 和 1 个 O 组成。

朴素的解法：思考哪些数据需要放到临界区，比如产生了几个 H 和 几个 O，当自己的职责完成后，检查是否 H20 了，如果未满足就 wait 或者跳出（只生产一个 H 时）。当满足 H20 时就激活信号量，重置状态。

上面的代码写起来还是比较繁琐的，考虑一下用一个状态机来描述这个问题。状态机如下，当状态为 -1 时，线程应该被阻塞。整个程序只需要纪录一个当前状态，代码简单逻辑清晰。

| State | H   | O   |
| ----- | --- | --- |
| 0 {}  | 1   | 4   |
| 1 H   | 3   | 2   |
| 2 HO  | 0   | -1  |
| 3 HH  | -1  | 0   |
| 4 O   | 2   | -1  |

