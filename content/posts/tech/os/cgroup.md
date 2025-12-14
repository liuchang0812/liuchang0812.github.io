---
title: "cgroup usage"
date: 2022-06-26T19:29:52+08:00
lastmod: 2022-06-26T19:29:52+08:00
author: ["Chang Liu"]
categories: 
- os
tags: 
- os
description: "cgroup 介绍与使用方法"
summary: "Linux cgroup 进程资源控制使用指南"
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

cgroup 全称是 control group，是 linux 下的一个内核模块，用来控制进程的系统资源使用。例如可以限制进程 cpu 使用量、内存使用量等。比如知名开源软件 docker 就是基于 cgroup 来限制容器资源使用，使用 namespace 隔离进程空间。

cgroup 分为 v1 和 v2 两个版本。常用的子系统有：

- cpu/cpuset/cpuacct：限制和统计 cpu 的用量
- memory：限制内存的用量
- blkio：限制块设备的用量，但是只能限制 `direct io`

## 使用方式

cgroup 基于 `linux vfs` 技术，将 cgroup 映射到一个目录。系统管理员通过在目录下创建文件的方式来使用 cgroup。默认情况下，cgroup 映射的目录为 `/sys/fs/cgroup` ，该目录下每个目录对应一个子系统。系统管理员可以在子系统目录中新建树状目录来设置 cgroup 限制，例如 `/sys/fs/cgroup/cpu/g1` 代表一类进程限制。

```bash
➜  ~ ls /sys/fs/cgroup  
blkio  cpu  cpuacct  cpu,cpuacct  cpuset  devices  freezer  hugetlb  memory  net_cls  oom  perf_event  pids  systemd
```

除了使用 `/sys/fs/cgroup` ，还可以通过 `cgcreate` 、 `cgexec` 等命令来使用 cgroup。例如

```bash
# 使用 /sys/fs/cgroup/cpu/test_cpu 来限制 ./test 进程运行
cgexec -g cpu:test_cpu ./test
```
