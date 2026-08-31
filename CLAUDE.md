# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码仓库中工作时提供指导。

## 项目概述

这是一个使用 Hugo 静态网站生成器构建的个人博客，使用 PaperMod 主题。博客名为"读书与编程"，包含技术文章、读书笔记和个人生活文章，内容以中文撰写。

网站地址：https://www.liuchang0812.com/

## Hugo 命令

**构建网站：**
```bash
hugo --minify
```

**启动本地开发服务器：**
```bash
hugo server
```

**启动并包含草稿：**
```bash
hugo server -D
```

## 内容结构

内容组织在 `content/` 目录下：
- `content/posts/tech/` - 技术文章，包含以下子目录：
  - `golang/` - Go 语言相关文章
  - `os/` - 操作系统相关主题（cgroup、libco、paxos 等）
  - `leetcode/` - 算法和 LeetCode 问题
  - `paper/` - 论文阅读笔记（GFS、Paxos、Raft）
  - `ai/` - AI/ML 主题（word2vec、autograd）
  - `read-code-vscode/` - 代码阅读笔记
- `content/posts/read/` - 读书笔记和书评
- `content/posts/life/` - 个人生活文章
- `content/about/` - 关于页面
- `content/archives.md` - 归档页面
- `content/search.md` - 搜索页面

### 创建新文章

使用 Hugo 的 archetype 系统创建带有正确 frontmatter 的新文章：

```bash
hugo new content/posts/tech/your-post-title.md
hugo new content/posts/tech/golang/your-post-title.md
hugo new content/posts/read/your-post-title.md
hugo new content/posts/life/your-post-title.md
```

archetype 模板位于 `archetypes/default.md`，包含了大部分必要的 frontmatter 字段。**重要提示：** archetype 不包含 `summary` 字段 - 你必须手动添加此字段，因为它对良好的用户体验至关重要。

### 文章 Frontmatter

所有文章都应包含以下 frontmatter 字段：
- `title` - 文章标题
- `date` - 发布日期（格式：YYYY-MM-DDTHH:MM:SS+08:00）
- `lastmod` - 最后修改日期
- `author` - 应设置为 ["Chang Liu"]
- `summary` - 用于预览的简短摘要（**必需** - archetype 中不包含，必须手动添加）
- `categories` - 主要分类，通常是以下之一："tech"、"read"、"life"
- `tags` - 具体标签列表（例如：golang、leveldb、paxos）
- `draft` - 发布的文章设置为 false
- `math` - 文章是否包含数学公式；为 true 时才会加载 KaTeX（默认 false，避免全站加载无用资源）
- `showToc` - 显示目录（默认 true）
- `TocOpen` - 自动展开目录（根据 config.yaml 默认为 false）

## 配置

网站配置位于 `config.yaml`：
- 主题：PaperMod（作为 git submodule 安装在 `themes/PaperMod`）
- 语言：中文（zh-cn）
- 启用的功能：代码复制按钮、目录、阅读时间、搜索（JSON 输出）、emoji 支持
- 数学公式：KaTeX 按需加载（仅 frontmatter `math: true` 的文章）
- 语法高亮：启用代码围栏的 Darcula 样式
- 菜单结构（按权重排序）：📚文章、🔍搜索、⏱时间轴、🙋🏻‍♂️关于

## 部署

网站在推送到 master 分支时通过 GitHub Actions 自动部署。

工作流文件：`.github/workflows/gh-pages.yml`
- Hugo 版本：0.152.2（extended）
- 构建到 `./public` 目录
- 使用 peaceiris/actions-gh-pages 部署到 GitHub Pages

**手动构建和部署：**
```bash
hugo --minify
# 输出在 ./public 目录
```

## 主题自定义

PaperMod 主题是 fork 的 submodule（`themes/PaperMod`，fork 自 adityatelange/hugo-PaperMod），针对本站做了少量定制：移除 Gitalk 评论、KaTeX 按需加载。

修改主题后需在 submodule 内提交并 push 到 fork（`liuchang0812/hugo-PaperMod`），然后更新父仓库的 submodule 指针，否则 CI 构建会失败。

其他自定义优先使用 Hugo 的覆盖机制（父仓库 `layouts/`）。

## 静态资源

静态文件放在 `static/` 目录：
- Favicons 和应用图标
- 自定义域名的 CNAME 文件
- KaTeX（字体已裁剪为 woff2）
- 文章中使用的图片可以放在 `static/` 或与文章放在同一位置

## 图片处理

文章中引用图片的方式：
- 从 static 的绝对路径：`/path/to/image.png`
- 相对路径：`./image.png`（与文章放在同一位置时）

## 内容指南

创建或修改文章时：
1. 所有文章必须包含 `summary` 字段用于预览
2. 使用统一的日期格式：`YYYY-MM-DD`
3. 读书笔记遵循命名规范：
   - 月度合集：`YYYY-MM-reading.md`
   - 单本书籍：`YYYY-MM-书名.md`
4. 技术文章应包含适当的标签（例如：leveldb、golang、paxos）
5. 代码块应指定语言以启用语法高亮
6. 文章使用中文撰写；保持一致的语气和术语

### 常见错别字清单（写作/修改时必须检查）

这些是本仓库历史文章中出现过的错别字，修改或新增文章时注意规避：

**同音/近音字混用：**
- `觉得`（不是"觉的"）；`请求`（不是"请示"——"请示"是下级向上级汇报，写系统/代码时几乎都是"请求"）
- `记录`（动词，如"记录误差"；"纪录"仅用于名词，如"打破纪录"）
- `分钟`（不是"分种"）；`生下来`（不是"省下来"）
- `只和...相关`（不是"只会...相关"）；`重视`（不是"重要"，如"不重视电报加密"）

**的/地/得：**
- 副词修饰动词用「地」：`100% 地投入到`、`慢慢地走`
- 补语用「得」：`跑得快`、`觉得很不错`
- 定语用「的」：`我的书`、`优美的句子`

**量词：**
- 图片用「张」：`上百万张图片`；数据集用「个」：`一个数据集`

**标点：**
- 疑问句末尾用「？」：`怎么保证自己投降之后的利益？`
- 英文缩写统一大写：`AI`（不是 `ai`）

**专有名词（不确定就查证）：**
- 人名：`单伟建`（不是"单伟健"，走出戈壁/金钱博弈的作者）
- 机构：`对外经济贸易大学`（不是"对外贸易大学"）
- frontmatter 中的 description 不要残留 markdown 标记（如 `**`）

## Git 工作流

- 主分支：`master`
- 提交会自动触发部署
- 主题是 git submodule - 克隆后使用 `git submodule update --init --recursive`
