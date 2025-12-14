---
title: "现代化的源码阅读方法"
date: 2024-11-18T22:05:42+08:00
lastmod: 2024-11-18T22:05:42+08:00
author: ["Chang Liu"]
tags: 
- clangd
- lsp
- leveldb
description: "现代化的源码阅读方法"
summary: "使用 LSP 和 clangd 高效阅读 C++ 源码"
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

LSP 是 VSCode 定义的一个语言无关的协议，提供代码解析补全等功能。本文以 leveldb 为例，介绍一下怎么通过 LSP 来更方便的阅读代码。

首先，我们需要下载代码，并生成 `compile_commands.json` 文件，clangd 会通过这个文件知道整个项目是如何编译的。

```bash
git clone https://github.com/google/leveldb.git

cd leveldb/

git submodule update --init

mkdir build
cd build
cmake -DCMAKE_EXPORT_COMPILE_COMMANDS=1  .. 
```

然后，我们就可以使用 VSCode 来阅读代码了，将鼠标放在变量名上，可以很容易的看到定义。可以任意的跳转定义和实现。可以方便的看到有哪些子类，有哪些地方调用了函数接口。

![test`](./Pasted%20image%2020241118214551.png)

![jpg](./Pasted%20image%2020241118213816.png)

也可以方便的查看 Call Hierarchy 和 Type Hierarchy。

- Call Hierarchy 有哪些地方调用了这个方法
- Type Hierarchy 有哪些子类

![jpg](./Pasted%20image%2020241118214952.png)

可以很方便的看到传参的含义。

