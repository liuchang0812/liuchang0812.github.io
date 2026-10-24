#!/usr/bin/env node
/**
 * 生成社交分享卡片（Open Graph image）。
 *
 * 每篇文章渲染一张 1200×630 的卡片到 assets/og/<文件名>.png，
 * 以及一张站点默认卡片 static/og-default.png。
 *
 * 用法：
 *   npm install          # 只需一次
 *   npm run og           # 重新生成全部卡片
 *   npm run og -- 只匹配的文件名关键字
 *
 * 依赖本机已安装的 Google Chrome（用 puppeteer-core 调用，不额外下载浏览器）。
 * 新增文章后跑一次即可；忘了跑也不会出错，会回退到默认卡片。
 */
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(
  decodeURIComponent(path.dirname(new URL(import.meta.url).pathname)),
  '..'
);
const CHROME =
  process.env.CHROME_PATH ||
  (process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : '/usr/bin/google-chrome');
const SITE = '读书与编程';
const DOMAIN = 'www.liuchang0812.com';
const filter = process.argv[2] || '';

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

function frontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const fm = m[1];
  const get = (key) => {
    const r = fm.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
    return r ? r[1].trim().replace(/^["']|["']$/g, '') : '';
  };
  // categories 是块列表，单独取，别和 tags 混在一起
  const block = fm.match(/^categories:[^\n]*\n((?:[ \t]*-[^\n]*\n?)*)/m);
  const categories = block
    ? [...block[1].matchAll(/^[ \t]*-[ \t]*(.+)$/gm)].map((x) => x[1].trim())
    : [];
  return {
    title: get('title'),
    date: (get('date') || '').slice(0, 10),
    draft: get('draft') === 'true',
    categories,
  };
}

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function card({ title, meta, kicker = SITE, big = false }) {
  const size = big ? 96 : title.length > 24 ? 54 : title.length > 14 ? 66 : 76;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#FAFAF8;
       font-family:"PingFang SC","Hiragino Sans GB","Microsoft YaHei",-apple-system,sans-serif;
       color:#141414;display:flex;overflow:hidden}
  .bar{width:8px;background:#141414;flex:none}
  .wrap{flex:1;padding:64px 80px 56px;display:flex;flex-direction:column}
  .top{display:flex;justify-content:space-between;align-items:baseline;
       font-size:21px;letter-spacing:.12em;color:#8A8A82;font-weight:500}
  .mid{flex:1;display:flex;flex-direction:column;justify-content:center;padding:24px 0}
  .title{font-size:${size}px;line-height:1.26;font-weight:700;letter-spacing:-0.015em;
         display:-webkit-box;-webkit-line-clamp:${big ? 2 : 3};-webkit-box-orient:vertical;overflow:hidden}
  .rule{width:64px;height:4px;background:#141414;margin-bottom:34px}
  .bottom{display:flex;justify-content:space-between;align-items:baseline;
          font-size:21px;color:#8A8A82;border-top:1px solid #E4E4DF;padding-top:24px}
  .dot{margin:0 12px;color:#C9C9C2}
  </style></head><body>
  <div class="bar"></div>
  <div class="wrap">
    <div class="top"><span>${esc(kicker)}</span><span>${DOMAIN}</span></div>
    <div class="mid"><div class="rule"></div><div class="title">${esc(title)}</div></div>
    <div class="bottom"><span>${meta}</span><span>${SITE}</span></div>
  </div></body></html>`;
}

const pages = walk(path.join(ROOT, 'content'))
  .map((f) => ({ f, ...frontmatter(fs.readFileSync(f, 'utf8')) }))
  .filter((p) => p.title && !p.draft && p.date)
  .filter((p) => !filter || path.basename(p.f).includes(filter));

const outDir = path.join(ROOT, 'assets', 'og');
fs.mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'shell',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--font-render-hinting=none'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

async function render(html, dest) {
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({ path: dest, type: 'png', optimizeForSpeed: false });
}

// 站点默认卡片
await render(
  card({ title: '读书与编程', meta: '读书笔记 · 技术文章 · 生活随笔', big: true }),
  path.join(ROOT, 'static', 'og-default.png')
);
console.log('✓ static/og-default.png');

for (const p of pages) {
  const cat = p.categories[0] === 'read' ? '读书笔记' : p.categories[0] === 'life' ? '生活随笔' : '技术';
  const meta = `${p.date.replace(/-/g, ' / ')}<span class="dot">·</span>${cat}`;
  const dest = path.join(outDir, path.basename(p.f, '.md') + '.png');
  await render(card({ title: p.title, meta }), dest);
  console.log('✓ assets/og/' + path.basename(dest));
}

await browser.close();
console.log(`\n完成：${pages.length} 张文章卡片 + 1 张默认卡片`);
