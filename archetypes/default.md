---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
lastmod: {{ .Date }}
author: ["Chang Liu"]
categories: # 三选一：tech / read / life
- tech
tags: # 从已有标签里选，别造新词（见 README 的标签表）
- os
summary: "" # 必填：一句话摘要，显示在列表、搜索结果和分享卡片上
description: "" # 选填：给搜索引擎看的一句话，留空则用 summary
weight: # 输入1可以顶置文章，用来给文章展示排序，不填就默认按时间排序
slug: ""
draft: true # 写完改成 false
math: false # 是否包含公式，true 时才会加载 KaTeX
showToc: true # 显示目录（标题少于 3 个时不会显示）
TocOpen: false # 目录默认折叠
hidemeta: false # 是否隐藏文章的元信息，如发布日期、作者等
disableShare: true # 底部不显示分享栏
showbreadcrumbs: true # 顶部显示当前路径
cover:
    image: ""
    caption: ""
    alt: ""
    relative: false
---
