---
title: "2266. 统计打字方案数"
date: 2022-05-10T22:21:58+08:00
lastmod: 2022-05-10T22:21:58+08:00
author: ["Chang Liu"]
categories: 
- leetcode
- cpp
tags: 
- cpp
- leetcode
description: ""
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

爬楼梯的加强版本，分别提前生成三个字母和四个字母的 fib 数组，然后分组统计后相乘。代码如下：

```cpp

class Solution {
public:

    int countTexts(string pressedKeys) {
        int f1[100005];
        int f2[100005];
        memset(f1, 0, sizeof f1);
        memset(f2, 0, sizeof f2);

        f1[0] = 1; f1[1] = 2; f1[2] = 4; 
        f2[0] = 1; f2[1] = 2; f2[2] = 4; f2[3] = 8;
        
        for (int i=3; i<100005; ++i) f1[i] = (0LL + f1[i-1] + f1[i-2] + f1[i-3])%int(1e9+7);
        for (int i=4; i<100005; ++i) f2[i] = (0LL + f2[i-1] + f2[i-2] + f2[i-3] + f2[i-4])%int(1e9+7);
        int ans = 1;
        int cur_ch = pressedKeys[0];
        int cur_cnt = 1;
        for (int i=1; i<pressedKeys.size(); ++i) {
            if (pressedKeys[i] != cur_ch) {
                if (cur_ch == '7' || cur_ch == '9')
                    ans = 1LL *ans * f2[cur_cnt - 1] % int(1e9+7);
                else 
                    ans = 1LL *ans *  f1[cur_cnt - 1] % int(1e9+7);
                
                cur_ch = pressedKeys[i];
                cur_cnt = 1;
            } else {
                ++ cur_cnt;
            }
        }

        if (cur_ch == '7' || cur_ch == '9')
            ans = 1LL * ans * f2[cur_cnt - 1] % int(1e9+7);
        else 
            ans = 1LL * ans * f1[cur_cnt - 1] % int(1e9+7);

        return ans;
    }
};
```