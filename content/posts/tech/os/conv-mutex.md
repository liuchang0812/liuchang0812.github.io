---
title: "信号量为什么还需要一个额外的互斥锁保护"
date: 2021-11-22T20:26:06+08:00
draft: true
categories:
- tech
description: "为什么信号量还需要一个互斥锁保护？"
summary: "理解 condition_variable 为什么需要配合 mutex 使用"
---

> 我们以 `C++11` 的 API 接口定义来描述

大家在编写多线程类的程序时，会用到信号量 [condition_variable](https://en.cppreference.com/w/cpp/thread/condition_variable)，有没有疑惑过为什么 cv 这类接口，在调用 `wait/notify` 时候还需要用一个 `mutex`。


