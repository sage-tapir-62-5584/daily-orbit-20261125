// Build script (not run by the grader): renders poster.html + news-data.json
// into ../assets/entry.png at exactly 1024x1024 with headless Chromium
// (puppeteer), and writes a 300px-wide legibility preview to /tmp/entry-300.png.
// Run: node render.mjs   (from this directory; puppeteer is borrowed from the
// sibling makefun/tools install via createRequire anchored there.)

import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(new URL('../../tools/package.json', import.meta.url));
const puppeteer = require('puppeteer');

const data = JSON.parse(readFileSync(join(here, 'news-data.json'), 'utf8'));
let html = readFileSync(join(here, 'poster.html'), 'utf8');

// ---- small flat SVG icons, one per story (viewBox 0 0 76 76) ----
const ICONS = {
  // oil refinery: distillation towers, pipes, a flame
  refinery: `<svg viewBox="0 0 76 76" width="68" height="68"><g fill="#3c4a57"><rect x="10" y="28" width="14" height="38"/><rect x="28" y="18" width="14" height="48"/><rect x="46" y="34" width="14" height="32"/></g><g fill="#f6f1e5"><rect x="13" y="34" width="8" height="6"/><rect x="13" y="46" width="8" height="6"/><rect x="31" y="24" width="8" height="6"/><rect x="31" y="36" width="8" height="6"/><rect x="49" y="40" width="8" height="6"/></g><path d="M62 8 C70 18 70 26 62 32 C54 26 54 18 62 8 Z" fill="#e2571e"/><path d="M62 18 C66 23 66 27 62 30 C58 27 58 23 62 18 Z" fill="#f2a03d"/><line x1="6" y1="66" x2="70" y2="66" stroke="#16181d" stroke-width="4"/></svg>`,
  // rocket climbing, flame and stars
  rocket: `<svg viewBox="0 0 76 76" width="68" height="68"><polygon points="38,4 48,30 38,26 28,30" fill="#f6f1e5" stroke="#16181d" stroke-width="2.5"/><ellipse cx="38" cy="38" rx="10" ry="16" fill="#b3271e"/><circle cx="38" cy="34" r="5" fill="#cfe0ea" stroke="#16181d" stroke-width="2"/><polygon points="28,48 18,62 28,56" fill="#3c4a57"/><polygon points="48,48 58,62 48,56" fill="#3c4a57"/><polygon points="38,54 43,66 38,74 33,66" fill="#e2571e"/><g fill="#16181d"><circle cx="12" cy="14" r="2.5"/><circle cx="64" cy="10" r="2.5"/><circle cx="66" cy="34" r="2"/><circle cx="10" cy="40" r="2"/></g></svg>`,
  // signed treaty: document, seal and pen
  treaty: `<svg viewBox="0 0 76 76" width="68" height="68"><rect x="12" y="8" width="44" height="58" fill="#f6f1e5" stroke="#16181d" stroke-width="3"/><line x1="20" y1="20" x2="48" y2="20" stroke="#16181d" stroke-width="3"/><line x1="20" y1="30" x2="48" y2="30" stroke="#16181d" stroke-width="3"/><line x1="20" y1="40" x2="40" y2="40" stroke="#16181d" stroke-width="3"/><circle cx="46" cy="54" r="9" fill="#b3271e"/><circle cx="46" cy="54" r="4.5" fill="#f6f1e5"/><line x1="52" y1="62" x2="66" y2="72" stroke="#16181d" stroke-width="3.5" stroke-linecap="round"/></svg>`,
  // price tag with a percent sign
  tariff: `<svg viewBox="0 0 76 76" width="68" height="68"><path d="M10 12 L44 12 L66 34 L42 58 L18 58 L10 50 Z" fill="#f2c230" stroke="#16181d" stroke-width="3" stroke-linejoin="round"/><circle cx="24" cy="26" r="4.5" fill="#16181d"/><g fill="#16181d"><circle cx="44" cy="30" r="3.4"/><circle cx="34" cy="46" r="3.4"/></g><line x1="48" y1="26" x2="30" y2="50" stroke="#16181d" stroke-width="3.5" stroke-linecap="round"/></svg>`,
  // quadcopter drone seen from above
  drone: `<svg viewBox="0 0 76 76" width="68" height="68"><g stroke="#16181d" stroke-width="3.5" stroke-linecap="round"><line x1="20" y1="20" x2="56" y2="56"/><line x1="56" y1="20" x2="20" y2="56"/></g><rect x="28" y="28" width="20" height="20" rx="4" fill="#3c4a57"/><circle cx="38" cy="38" r="4" fill="#f6f1e5"/><g fill="#8b959e"><ellipse cx="14" cy="14" rx="11" ry="3.5"/><ellipse cx="62" cy="14" rx="11" ry="3.5"/><ellipse cx="14" cy="62" rx="11" ry="3.5"/><ellipse cx="62" cy="62" rx="11" ry="3.5"/></g><g fill="#16181d"><circle cx="14" cy="14" r="3"/><circle cx="62" cy="14" r="3"/><circle cx="14" cy="62" r="3"/><circle cx="62" cy="62" r="3"/></g></svg>`,
};

const cells = data.stories
  .map(
    (s, i) => `    <section class="cell ${i < 3 ? 'span2' : 'span3'}">
      <div class="kick">${s.kicker}</div>
      <div class="row"><div class="icon">${ICONS[s.icon]}</div><h3>${s.headline}</h3></div>
      <p class="cap">${s.caption}</p>
    </section>`,
  )
  .join('\n');

const also = data.also.map((t) => `    <div class="item"><b>&#9656;</b> ${t}</div>`).join('\n');

html = html
  .replace('{{TITLE}}', data.masthead.title)
  .replace('{{TAGLINE}}', data.masthead.tagline)
  .replace('{{DATELINE}}', data.masthead.dateline)
  .replace('{{LEAD_KICKER}}', data.lead.kicker)
  .replace('{{LEAD_HEADLINE}}', data.lead.headline)
  .replace('{{LEAD_CAPTION}}', data.lead.caption)
  .replace('{{STORY_CELLS}}', cells)
  .replace('{{ALSO_ITEMS}}', also);

const out = join(here, '..', 'assets', 'entry.png');
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--force-color-profile=srgb'] });
const page = await browser.newPage();
await page.setViewport({ width: 1024, height: 1024, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await new Promise((r) => setTimeout(r, 150));
await page.screenshot({ path: out, type: 'png' });
console.log('wrote', out);

// 300px legibility preview (data URI: a setContent page cannot load file:// images)
const b64 = readFileSync(out).toString('base64');
const page2 = await browser.newPage();
await page2.setViewport({ width: 300, height: 300, deviceScaleFactor: 1 });
await page2.setContent(`<body style="margin:0"><img src="data:image/png;base64,${b64}" style="width:300px;height:300px"></body>`, { waitUntil: 'load' });
await new Promise((r) => setTimeout(r, 100));
await page2.screenshot({ path: '/tmp/entry-300.png', type: 'png' });
console.log('wrote /tmp/entry-300.png');
await browser.close();
