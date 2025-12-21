# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog built with Hugo static site generator, using the PaperMod theme. The blog is titled "代码与远方" (Code and Beyond) and contains technical articles, book reviews, and personal life posts written in Chinese.

Site URL: https://www.liuchang0812.com/

## Hugo Commands

**Build the site:**
```bash
hugo --minify
```

**Start local development server:**
```bash
hugo server
```

**Start with drafts enabled:**
```bash
hugo server -D
```

## Content Structure

Content is organized under `content/` directory:
- `content/posts/tech/` - Technical articles (Go, algorithms, papers, OS, AI topics)
- `content/posts/read/` - Book reviews and reading notes
- `content/posts/life/` - Personal life posts
- `content/about/` - About page
- `content/archives.md` - Archives page
- `content/search.md` - Search page

### Creating New Posts

Use Hugo's archetype system to create new posts with proper frontmatter:

```bash
hugo new content/posts/tech/your-post-title.md
hugo new content/posts/read/your-post-title.md
hugo new content/posts/life/your-post-title.md
```

The archetype template is in `archetypes/default.md` and includes all necessary frontmatter fields.

### Post Frontmatter

All posts should include these frontmatter fields:
- `title` - Post title
- `date` - Publication date
- `lastmod` - Last modified date
- `author` - Should be ["Chang Liu"]
- `summary` - Brief summary for preview (required for good UX)
- `tags` - List of tags
- `categories` - Optional categories
- `draft` - Set to false for published posts
- `showToc` - Display table of contents (default true)
- `TocOpen` - Auto-expand TOC (default true)

## Configuration

Site configuration is in `config.yaml`:
- Theme: PaperMod (installed as git submodule in `themes/PaperMod`)
- Language: Chinese (zh-cn)
- Features enabled: code copy buttons, TOC, reading time, search (JSON output)
- CDN configuration for assets: jsdelivr CDN
- Menu structure: 文章 (Posts), 搜索 (Search), 时间轴 (Timeline), 关于 (About)

## Deployment

The site automatically deploys via GitHub Actions on push to master branch.

Workflow file: `.github/workflows/gh-pages.yml`
- Hugo version: 0.152.2 (extended)
- Builds to `./public` directory
- Deploys to GitHub Pages using peaceiris/actions-gh-pages

**Manual build and deployment:**
```bash
hugo --minify
# Output is in ./public directory
```

## Theme Customization

The PaperMod theme is added as a git submodule. To update the theme:

```bash
git submodule update --remote themes/PaperMod
```

Do not modify theme files directly. Use Hugo's override mechanism if customization is needed.

## Static Assets

Static files go in `static/` directory:
- Favicons and app icons
- CNAME file for custom domain
- Additional CSS/JS (gitalk for comments)
- Images used in posts can be placed in `static/` or co-located with posts

## Working with Images

Images can be referenced in posts using:
- Absolute paths from static: `/path/to/image.png`
- Relative paths: `./image.png` (when co-located with post)
- CDN paths are automatically configured via config.yaml

## Content Guidelines

When creating or modifying posts:
1. All posts must have a `summary` field for preview purposes
2. Use consistent date format: `YYYY-MM-DD`
3. Reading notes follow naming conventions:
   - Monthly compilations: `YYYY-MM-reading.md`
   - Individual books: `YYYY-MM-bookname.md`
4. Technical posts should include appropriate tags (e.g., leveldb, golang, paxos)
5. Code blocks should specify language for syntax highlighting
6. Posts are in Chinese; maintain consistent tone and terminology

## Git Workflow

- Main branch: `master`
- Commits automatically trigger deployment
- Theme is a git submodule - use `git submodule update --init --recursive` after clone
