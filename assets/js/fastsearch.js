/* 站内搜索
 *
 * 主题自带的实现用 Fuse.js 做模糊匹配，但它按空格切词，
 * 中文（没有空格）几乎匹配不到，还会把不相关的文章排在前面。
 * 这里改成「子串命中 + 权重打分」：中文按字面匹配，英文按词匹配，
 * 40 篇文章的规模下，全量线性扫描是毫秒级的。
 */
(() => {
  const input = document.getElementById('searchInput');
  const list = document.getElementById('searchResults');
  if (!input || !list) return;

  let docs = [];
  let composing = false;

  const stripTags = (s) =>
    (s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const termsOf = (q) =>
    q
      .toLowerCase()
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean);

  fetch('../index.json')
    .then((r) => r.json())
    .then((data) => {
      docs = data
        .map((d) => {
          const title = stripTags(d.title);
          const summary = stripTags(d.summary);
          const content = stripTags(d.content);
          return {
            title,
            url: d.permalink,
            summary,
            content,
            _t: title.toLowerCase(),
            _s: summary.toLowerCase(),
            _c: content.toLowerCase(),
          };
        })
        .filter((d) => d.title && d.url);
      // 索引就绪后如果输入框已有内容，补一次搜索
      if (input.value.trim()) run(input.value.trim());
    })
    .catch(() => {});

  function score(doc, terms) {
    let total = 0;
    for (const t of terms) {
      let s = 0;
      const ti = doc._t.indexOf(t);
      if (ti >= 0) s += 120 + (ti === 0 ? 60 : 0) + (doc._t.length === t.length ? 40 : 0);
      if (doc._s.includes(t)) s += 45;
      const ci = doc._c.indexOf(t);
      if (ci >= 0) s += 22 + Math.max(0, 8 - ci / 400);
      if (s === 0) return 0; // 每个词都得命中，避免模糊匹配带来的噪音
      total += s;
    }
    return total;
  }

  function snippet(doc, terms) {
    const text = doc.content || doc.summary;
    if (!text) return '';
    const lower = text.toLowerCase();
    let at = -1;
    for (const t of terms) {
      const i = lower.indexOf(t);
      if (i >= 0 && (at < 0 || i < at)) at = i;
    }
    if (at < 0) return esc(text.slice(0, 90)) + (text.length > 90 ? '…' : '');
    const start = Math.max(0, at - 36);
    const end = Math.min(text.length, at + 110);
    return (start > 0 ? '…' : '') + esc(text.slice(start, end)) + (end < text.length ? '…' : '');
  }

  function highlight(text, terms) {
    let out = esc(text);
    for (const t of terms) {
      out = out.replace(new RegExp('(' + escRe(t) + ')', 'gi'), '<mark>$1</mark>');
    }
    return out;
  }

  function render(results, q) {
    const terms = termsOf(q);
    if (!results.length) {
      list.innerHTML = `<li class="search-empty">没有找到和「${esc(q)}」相关的文章，换个词试试。</li>`;
      return;
    }
    const rows = results.map(({ doc }) => {
      const sn = snippet(doc, terms);
      return `<li class="post-entry search-result">
        <header class="entry-header"><h2>${highlight(doc.title, terms)}</h2></header>
        ${sn ? `<div class="entry-content"><p>${highlight(sn, terms)}</p></div>` : ''}
        <a class="entry-link" href="${doc.url}" aria-label="${esc(doc.title)}"></a>
      </li>`;
    });
    rows.unshift(`<li class="search-meta">找到 ${results.length} 篇</li>`);
    list.innerHTML = rows.join('');
  }

  function run(q) {
    if (!docs.length) return;
    const terms = termsOf(q);
    if (!terms.length) {
      list.innerHTML = '';
      return;
    }
    const results = docs
      .map((doc) => ({ doc, score: score(doc, terms) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30);
    render(results, q);
  }

  let timer;
  input.addEventListener('input', () => {
    if (composing) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      const q = input.value.trim();
      if (q) run(q);
      else list.innerHTML = '';
    }, 80);
  });

  input.addEventListener('compositionstart', () => (composing = true));
  input.addEventListener('compositionend', () => {
    composing = false;
    input.dispatchEvent(new Event('input'));
  });

  input.addEventListener('search', () => {
    if (!input.value) list.innerHTML = '';
  });

  // 上下键在结果间移动
  document.addEventListener('keydown', (e) => {
    const links = [...list.querySelectorAll('.search-result .entry-link')];
    if (!links.length) return;
    const idx = links.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      links[Math.min(links.length - 1, idx + 1)].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (idx <= 0) input.focus();
      else links[idx - 1].focus();
    }
  });
})();
