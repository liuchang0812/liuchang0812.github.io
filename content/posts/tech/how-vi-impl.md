---
title: "VI 是如何实现的"
date: 2023-06-09T22:05:42+08:00
lastmod: 2023-06-09T22:05:42+08:00
author: ["Chang Liu"]
tags: 
- vi
- tech
categories:
- tech
description: "VI 是如何实现的"
summary: "通过 BusyBox VI 实现学习终端编程和 escape code"
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: ""
draft: true # 是否为草稿
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

Vi 支持光标的移动，支持状态栏展示以及在状态栏输入命令。Linux 中的 Vi 实现比较复杂。通过阅读 linux vi 实现来搞明白成本比较高。我们可以通过学习 `busybox` 中的实现,花相对较小的成本精力来搞明白终端编程是如何实现的。

# 背景知识

## 终端

因为 Vi 是编辑器，所以不希望终端缓存输入。在 Vi 实现中会将终端设置为 raw 模式，每一次键盘输入都传递到 Vi 程序。

## escape code

代码的最开始，打印了 `?1049h`，通过查手册[1],可以知道实现了如下效果：保存当前光标的位置，切换到Alternate  Screen Buffer。在程序退出前，打印了 `?1049l`，这个实现了与 `?1049h` 相反的功能：切换回正常的 Screen Buffer, 恢复光标位置。实现的效果也就是你输入 vi 命令后，会显示到一清空的新终端界面，当你退出 vi 后，又显示回你进入 vi 之前的样子。

> 1049h: Save cursor as in DECSC, xterm.  After saving the cursor, switch to the Alternate Screen Buffer, clearing it first.

> 1049l: Use Normal Screen Buffer and restore cursor as in DECRC, xterm. 


# 代码分析

## 总体思路
默认显示 24*80 的字符，最后一行为状态栏。

## 重点变量

在代码实现中主要有如下变量：

- `text` 文件内容字符串，比如当前编辑文件 file1，text 变量就会保存 file1 的内容。
- `screen` 要显示到屏幕的字符串。根据当前光标的位置，从 `text` 中生成显示到屏幕的字符串。如果 text 是空的话，会显示 row-1 行 `~`。最后一行为状态栏，显示位置文件行数等信息。
- `dot` 指针，指向 text 光标的位置。要一直保证 `dot` 在 `screenbegin` 和 `end_screen()`之间，这样才能示在屏幕中。
- `screenbegin`指针，指向 `text` ，是屏幕要显示的内容的开始位置。
- `crow, ccol` 光标位置
- `offset`  看代码是用来实现屏幕滚动条左右滚动的时候用的

## 实现细节

一些细节
- main 函数
	- 全局初始化和解析参数
	- `write1(ESC"[?1049h");` 保存光标，使用修改的屏幕缓存，清屏
	- 对每个文件调用 `edit_file` 函数
	- `write1(ESC"[?1049l");` 使用标准屏幕缓存，恢复光标

- `edit_file` 函数
	- 调用 `rawmode`：关闭echo，关闭 line 模式等，每按一个按键都会直接传递到程序，不会按行缓存输入。
	- 调用 `new_screen`：申请virtual screen的内存
	- 调用 `init_text_buffer(fn)`：fn 是文件名，把文件内容全部加载到内存中 text 变量（dot/begin/end 指针指向 text 中位置），li 是文件行数。
	- 一些变量的初始化 TODO
		- ccol
		- crow
		- cmd_mode
		- offset
	- 循环读取输入字符，调用`do_cmd(c)`相应处理。
	- `go_bottom_and_clear_to_eol` 和 `cookmode`

- `do_cmd` 函数
	- 光标移动类的命令，会调用到 `dot_scroll` 函数
	- esc 则会进入命令模式：标记 cmd_mode 为 0，清空任务队列


# 附录

[1]: https://invisible-island.net/xterm/ctlseqs/ctlseqs.html 一个特别完整的 escape code 列表