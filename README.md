# 读书与编程

个人博客（[www.liuchang0812.com](https://www.liuchang0812.com/)），[Hugo](https://gohugo.io/) + [PaperMod](https://github.com/adityatelange/hugo-PaperMod) 构建，中文写作。

## 本地开发

```bash
git submodule update --init --recursive   # 克隆后初始化主题
hugo server -D                            # 本地预览（含草稿）
hugo --minify                             # 生产构建，输出到 public/
```

需要 Hugo **extended** 0.152.2（与 CI 一致）。

## 目录结构

```
content/posts/tech/    技术文章（golang / os / leetcode / paper / ai / read-code-vscode）
content/posts/read/    读书笔记
content/posts/life/    生活随笔
content/about/         关于页
layouts/               覆盖主题的模板（优先于 themes/PaperMod）
assets/css/extended/   自定义样式，自动拼进全站 CSS
assets/js/             覆盖主题脚本（目前是站内搜索）
assets/og/             每篇文章的分享卡片（自动生成，见下）
i18n/zh-cn.yaml        中文界面文案
scripts/gen-og.mjs     分享卡片生成器
static/                favicon、KaTeX、默认分享图
```

## 相对原版 PaperMod 的改动

- **中文优先**：`defaultContentLanguage: zh-cn`，界面文案走 `i18n/zh-cn.yaml`
- **版心 780px**：中文一行 40 字左右，比默认的 1024px 好读
- **赭石色点缀**：只用在 h2 竖线、链接 hover、搜索高亮、404 上
- **目录**：标题少于 3 个不显示，默认折叠
- **相关文章**：按标签 + 时间推荐 3 篇
- **归档**：中文月份的时间轴
- **搜索**：替换了 Fuse.js（对中文几乎无效），改成子串匹配 + 权重打分
- **分享卡片**：每篇文章一张 1200×630 的 OG 图
- **404**：中文提示 + 入口 + 最近文章

模板覆盖都在 `layouts/`，主题 submodule 保持接近上游，方便以后更新。

## 分享卡片

每篇文章在 `assets/og/<文件名>.png` 有一张分享图，`static/og-default.png` 是站点默认图。
新增文章后：

```bash
npm install   # 只需一次
npm run og    # 重新生成全部卡片
```

依赖本机安装的 Chrome（通过 puppeteer-core 调用，不额外下载浏览器）。
忘了跑也不会坏——模板会回退到默认卡片。

## 写文章

```bash
hugo new content/posts/tech/your-post-title.md
```

- **`summary` 必填**：一句话摘要，出现在列表、搜索结果和分享卡片上
- **标题**：中文标题，不要用 `golang | xxx` 这种前缀写法
- **标签**：从已有标签里选，别造新词。常用的是
  `读书 / 传记 / 历史 / 社科 / 政治 / 商业`、`os / golang / leveldb / paxos / raft / gfs / ai / leetcode / cpp`
- **公式**：文章里有数学公式时设 `math: true`，否则不加载 KaTeX
- **读书笔记**：文件名 `YYYY-MM-书名.md`，标题写成 `YYYY MM 读书分享：书名`（全角冒号）

## 部署

推送到 `master` 后由 GitHub Actions 自动构建并发布到 GitHub Pages（`.github/workflows/gh-pages.yml`）。

## 主题定制

主题是 fork 的 submodule（`themes/PaperMod`）。**能不改主题就不改**，优先在 `layouts/`、`assets/` 里覆盖；
确实要改主题，需在 submodule 内提交并 push 到 fork，再更新父仓库的 submodule 指针，否则 CI 会失败。
