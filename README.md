# 读书与编程

个人博客（[www.liuchang0812.com](https://www.liuchang0812.com/)），使用 [Hugo](https://gohugo.io/) 静态站点生成器 + [PaperMod](https://github.com/adityatelange/hugo-PaperMod) 主题构建，内容以中文撰写。

## 本地开发

```bash
# 克隆后初始化主题 submodule
git submodule update --init --recursive

# 本地预览（含草稿）
hugo server -D

# 生产构建
hugo --minify
```

## 内容结构

- `content/posts/tech/` — 技术文章（golang / os / leetcode / paper / ai / read-code-vscode）
- `content/posts/read/` — 读书笔记
- `content/posts/life/` — 生活随笔
- `content/about/` — 关于页

新建文章：

```bash
hugo new content/posts/tech/your-post-title.md
```

**注意**：新建后需手动补充 `summary` 字段；如果文章包含数学公式，把 `math` 设为 `true`（只有设了 `math: true` 才会加载 KaTeX，避免全站加载无用资源）。

## 部署

推送到 `master` 分支后由 GitHub Actions 自动构建并部署到 GitHub Pages（`.github/workflows/gh-pages.yml`）。

## 主题自定义

主题是 fork 的 submodule（`themes/PaperMod`），针对本站做了少量定制：

- 移除 Gitalk 评论
- KaTeX 按需加载（frontmatter `math: true` 才注入）
- 其他自定义优先使用 Hugo 的覆盖机制（`layouts/`）

修改主题后需要先在 submodule 内提交并 push 到 fork，再更新父仓库的 submodule 指针，否则 CI 构建会失败。
