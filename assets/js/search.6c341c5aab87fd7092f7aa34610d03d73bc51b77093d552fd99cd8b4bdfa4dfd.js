/* 占位覆盖：主题会把 js/fuse.basic.min.js 一起 concat 进 assets/js/search.js。
   本站的 assets/js/fastsearch.js 已经换成自己写的中文子串打分，不再用 Fuse，
   所以用这个空文件把主题那份 15KB 的 Fuse 顶掉，避免搜索页白下载一段死代码。
   详见 CLAUDE.md「主题覆盖清单」。 */

;
/*
  PaperMod v7
  License: MIT https://github.com/adityatelange/hugo-PaperMod/blob/master/LICENSE
  Copyright (c) 2020 nanxiaobei and adityatelange
  Copyright (c) 2021-2024 adityatelange
*/

;
(()=>{(()=>{const e=document.getElementById("searchInput"),t=document.getElementById("searchResults");if(!e||!t)return;let s=[],o=!1;const i=e=>(e||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim(),n=e=>String(e).replace(/[&<>"]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[e])),d=e=>e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),r=e=>e.toLowerCase().split(/\s+/).map(e=>e.trim()).filter(Boolean);fetch("../index.json").then(e=>e.json()).then(t=>{s=t.map(e=>{const t=i(e.title),n=i(e.summary),s=i(e.content);return{title:t,url:e.permalink,summary:n,content:s,_t:t.toLowerCase(),_s:n.toLowerCase(),_c:s.toLowerCase()}}).filter(e=>e.title&&e.url),e.value.trim()&&l(e.value.trim())}).catch(()=>{});function m(e,t){let n=0;for(const o of t){let s=0;const i=e._t.indexOf(o);i>=0&&(s+=120+(i===0?60:0)+(e._t.length===o.length?40:0)),e._s.includes(o)&&(s+=45);const a=e._c.indexOf(o);if(a>=0&&(s+=22+Math.max(0,8-a/400)),s===0)return 0;n+=s}return n}function h(e,t){const s=e.content||e.summary;if(!s)return"";const r=s.toLowerCase();let o=-1;for(const n of t){const e=r.indexOf(n);e>=0&&(o<0||e<o)&&(o=e)}if(o<0)return n(s.slice(0,90))+(s.length>90?"…":"");const i=Math.max(0,o-36),a=Math.min(s.length,o+110);return(i>0?"…":"")+n(s.slice(i,a))+(a<s.length?"…":"")}function a(e,t){let s=n(e);for(const e of t)s=s.replace(new RegExp("("+d(e)+")","gi"),"<mark>$1</mark>");return s}function u(e,s){const o=r(s);if(!e.length){t.innerHTML=`<li class="search-empty">没有找到和「${n(s)}」相关的文章，换个词试试。</li>`;return}const i=e.map(({doc:e})=>{const t=h(e,o);return`<li class="post-entry search-result">
        <header class="entry-header"><h2>${a(e.title,o)}</h2></header>
        ${t?`<div class="entry-content"><p>${a(t,o)}</p></div>`:""}
        <a class="entry-link" href="${e.url}" aria-label="${n(e.title)}"></a>
      </li>`});i.unshift(`<li class="search-meta">找到 ${e.length} 篇</li>`),t.innerHTML=i.join("")}function l(e){if(!s.length)return;const n=r(e);if(!n.length){t.innerHTML="";return}const o=s.map(e=>({doc:e,score:m(e,n)})).filter(e=>e.score>0).sort((e,t)=>t.score-e.score).slice(0,30);u(o,e)}let c;e.addEventListener("input",()=>{if(o)return;clearTimeout(c),c=setTimeout(()=>{const n=e.value.trim();n?l(n):t.innerHTML=""},80)}),e.addEventListener("compositionstart",()=>o=!0),e.addEventListener("compositionend",()=>{o=!1,e.dispatchEvent(new Event("input"))}),e.addEventListener("search",()=>{e.value||(t.innerHTML="")}),document.addEventListener("keydown",n=>{const s=[...t.querySelectorAll(".search-result .entry-link")];if(!s.length)return;const o=s.indexOf(document.activeElement);n.key==="ArrowDown"?(n.preventDefault(),s[Math.min(s.length-1,o+1)].focus()):n.key==="ArrowUp"&&(n.preventDefault(),o<=0?e.focus():s[o-1].focus())})})()})()