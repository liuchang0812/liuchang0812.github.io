---
title: "控制论算法 PID"
date: 2025-04-16T20:49:51+08:00
lastmod: 2025-04-17T20:49:51+08:00
author: ["Chang Liu"]
tags: 
- pid
- tech
summary: "学习一下怎么控制火箭🚀"
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: ""
draft: false # 是否为草稿
comments: true
showToc: true # 显示目录
TocOpen: true # 自动展开目录
hidemeta:  true # 是否隐藏文章的元信息，如发布日期、作者等
disableShare: true # 底部不显示分享栏
showbreadcrumbs: true #顶部显示当前路径
cover:
    image: "./pid/image.png"
    caption: ""
    alt: ""
    relative: false
---

一直有听说 PID 算法，最近学习了一下，看一下在我们的系统中是否能解决一些痛点问题。

# **PID控制**

在工业控制、机器人、智能设备等领域，PID算法如同一个隐形的"调节大师"，默默支撑着无数系统的稳定运行。这种诞生于20世纪的控制算法，凭借其简洁的结构和强大的适应性，至今仍是自动控制领域的核心技术之一。

# **核心原理：三位一体的智慧**  

PID是比例（Proportional）、积分（Integral）、微分（Derivative）控制的简称，其核心思想是通过误差的三种维度进行动态补偿。数学表达式为：  

$$
u(t) = K_p \cdot e(t) + K_i \cdot \int e(t) \, dt + K_d \cdot \frac{de(t)}{dt}
$$

- **比例项**（P）实时响应当前偏差，像精准的标枪手快速修正系统状态  
- **积分项**（I）累积历史误差，消除系统稳态偏差，如同经验丰富的老师傅修正细微偏差  
- **微分项**（D）预测未来趋势，抑制超调震荡，扮演着"防患未然"的预警角色  


## 离散化公式
~~TODO: 补充离散化的公式/ delta 公式的推导~~

在离散化的场景下，比如一分种一个点的情况下，三个参数分别：

* 本次误差：用当前的值和预期值直接减
* 积分：纪录一个之前误差和，再加上本次误差
* 微分：纪录一个上次误差，用本次误差减去上次误差，再除以时间分片

换成数学公式就是 （$\Delta$ 代表时间分片，$e(t)$ 代表第 t 时间的误差, $Esum$ 代表误差和）
$$
u(t) = K_p \cdot (e(t)-e(t-1)) + K_i \cdot (\int_{i=0}^{t} e(i)) + K_d \cdot \frac{(e(t) - e(t-1))}{\Delta}
$$

## 增量化公式

上面那个方法要保存误差和，会有溢出的风险。还可以考虑用增量的表达方法，推导的方法是

$$
\Delta u_k = u_k - u_{k-1}
$$

把 $u_k$ 和 $u_{k-1}$ 代入上面的离散公式可以得到

$$
\Delta u_k = K_p \cdot (e(k) - e(k-1)) + K_i \cdot e(k) + K_d \cdot (e(k) - 2e(k-1) + e(k-2))
$$

从上面公式可以看到，u_k 只会 3 次误差相关，不用算积分啦。


# **实际应用中的艺术**  

PID参数调校堪称控制领域的"玄学"，工程师需要根据系统特性平衡三者关系：  
- 增大Kₚ加快响应速度，但过量会导致震荡  
- 提高Kᵢ消除静差，但可能引起积分饱和  
- 加强Kₐ抑制超调，但对噪声敏感  

TODO: 介绍一个调整方法

# **现代演进与未来**  

从恒温控制到火箭姿态调整，从传统PID到模糊PID、自适应PID等变种算法，这种经典控制理论持续焕发新生。在智能制造和物联网时代，PID作为基础控制算法，仍将在自动化系统中扮演关键角色。理解PID，就是掌握了一把打开现代控制技术大门的钥匙。


1. [csdn](https://blog.csdn.net/as480133937/article/details/89508034)
2. [wiki](https://en.wikipedia.org/wiki/Proportional%E2%80%93integral%E2%80%93derivative_controller#Control_loop_example)