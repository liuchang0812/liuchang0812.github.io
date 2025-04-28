---
title: "自动微分系统实现"
date: 2025-04-28T23:49:51+08:00
lastmod: 2025-04-28T23:49:51+08:00
author: ["Chang Liu"]
tags: 
- ml
- tech
summary: "学习一下怎么实现机器学习框架🚀"
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

用过 `pytorch` 的小朋友都知道，只要调用一行 `loss.backward()`, 框架就会自动把所有变量的偏导数计算出来。这个看起来很神奇，一起来研究一下它是怎么实现的吧。本文简单介绍它的原理，然后提供一个简易的 CPP 实现帮忙理解。

-----

## **基础知识**

### 链式法则

在导数计算方法里面有一个链式法则（大家应该都学过，但是忘得差不多了）。对于一个函数 $f(g(x))$ 的导数等于 $f'(g(x))*g'(x)$。也可又写成
 $$\frac{\partial z}{\partial y} = \frac{\partial z}{\partial u}*\frac{\partial u}{\partial y}$$

### 反向传导

有了上面的链式法则，我们就可以很巧妙的求导数了。假如我们有如下公式，要求 $\frac{\partial z}{\partial x}$ 的值，就可又转换为 $\frac{\partial z}{\partial y} * \frac{\partial y}{\partial x}$

```python
y = x^3+x^2
z = 2*y-4
```

### 求导过程

把计算过程当成一个图来看，z 是最终的输出结点，看成是根结点。x 是输入结点，看成是叶子结点。就可以得到一个有向图。在自动求导的过程中，从根结点开始向下递归，z 结点的梯度是 $\frac{\partial z}{\partial z}=1$。然后 y 结点是 z 的子结点，y 的结点就是 $\frac{\partial z}{\partial y} * z.grad$。然后再计算 x 结点就是 $\frac{\partial z}{\partial x} * z.grad = \frac{\partial y}{\partial x} * y.grad$。

可以看出来就是一个递归的过程。


## 代码实现

这儿提供一个 deepseek 实现的简单版本

```cpp
#include <stdio.h>
#include <stdlib.h>
#include <math.h>

// 定义操作类型枚举
typedef enum {
    OP_CONST,   // 常量
    OP_ADD,     // 加法
    OP_MUL,     // 乘法
    OP_POW      // 幂运算
} OpType;

// 微分值结构体
typedef struct Value {
    double data;        // 数据值
    double grad;        // 梯度值
    OpType op;          // 操作类型
    struct Value* prev[2]; // 前驱节点（最多两个输入）
    void (*backward)(struct Value*); // 反向传播函数
} Value;

// 创建叶子节点（无操作）
Value* create_leaf(double data) {
    Value* v = (Value*)malloc(sizeof(Value));
    v->data = data;
    v->grad = 0.0;
    v->op = OP_CONST;
    v->prev[0] = v->prev[1] = NULL;
    v->backward = NULL;
    return v;
}

// 加法运算
Value* add(Value* a, Value* b) {
    Value* v = (Value*)malloc(sizeof(Value));
    v->data = a->data + b->data;
    v->grad = 0.0;
    v->op = OP_ADD;
    v->prev[0] = a;
    v->prev[1] = b;
    v->backward = NULL;
    return v;
}

// 乘法运算
Value* mul(Value* a, Value* b) {
    Value* v = (Value*)malloc(sizeof(Value));
    v->data = a->data * b->data;
    v->grad = 0.0;
    v->op = OP_MUL;
    v->prev[0] = a;
    v->prev[1] = b;
    v->backward = NULL;
    return v;
}

// 幂运算
Value* pow_(Value* a, double exponent) {
    Value* v = (Value*)malloc(sizeof(Value));
    v->data = pow(a->data, exponent);
    v->grad = 0.0;
    v->op = OP_POW;
    v->prev[0] = a;
    v->prev[1] = create_leaf(exponent); // 指数作为常量节点
    v->backward = NULL;
    return v;
}

// 反向传播实现
void backward(Value* v) {
    // 初始化输出梯度为1（dz/dz = 1）
    v->grad = 1.0;
    
    // 反向传播递归函数
    void _backward(Value* v) {
        if (v == NULL) return;
        
        switch (v->op) {
            case OP_ADD:
                v->prev[0]->grad += v->grad * 1.0; // da/dx = 1
                v->prev[1]->grad += v->grad * 1.0; // db/dy = 1
                break;
                
            case OP_MUL:
                v->prev[0]->grad += v->grad * v->prev[1]->data; // da/dx = y
                v->prev[1]->grad += v->grad * v->prev[0]->data; // db/dy = x
                break;
                
            case OP_POW: {
                double exponent = v->prev[1]->data;
                v->prev[0]->grad += v->grad * exponent * pow(v->prev[0]->data, exponent-1);
                break;
            }
            
            case OP_CONST:
                break;
        }
        
        // 递归传播
        _backward(v->prev[0]);
        _backward(v->prev[1]);
    }
    
    _backward(v);
}

// 示例使用
int main() {
    // 创建输入变量
    Value* x = create_leaf(2.0);
    Value* y = create_leaf(3.0);
    
    // 构建计算图：z = x^2 * y + y + 2
    Value* x_sq = pow_(x, 2);
    Value* term1 = mul(x_sq, y);
    Value* term2 = add(term1, y);
    Value* z = add(term2, create_leaf(2.0));
    
    // 执行反向传播
    backward(z);
    
    // 打印结果
    printf("dz/dx = %.2f\n", x->grad); // 应输出 12.00
    printf("dz/dy = %.2f\n", y->grad); // 应输出 5.00
    
    // 释放内存（简化示例，实际需要更严谨的内存管理）
    free(x); free(y); free(x_sq);
    free(term1); free(term2); free(z);
    
    return 0;
}
```