// The admin page: visitors get a sign-in prompt and cannot list players; the admin sees every player with their progress.
const { chromium } = require('playwright');
const WEB = process.env.WEB_URL;
const newContext = async (b) => { const c = await b.newContext({ viewport: { width: 1100, height: 812 } }); await c.addInitScript(() => { window.__ACADEMY_EMULATOR = true; }); const p = await c.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_|fonts|favicon|ytimg|youtube|emulator|permission|400 \(Bad Request\)/i.test(m.text())) errs.push('console: ' + m.text()); });
  return { c, p, errs }; };
const ready = async p => { await p.goto(WEB); await p.waitForFunction(() => window.__academy && window.__academy.S.ready, null, { timeout: 20000 }); await p.waitForTimeout(300); };
const w = (p, ms) => p.waitForTimeout(ms);
const text = (p, s) => p.evaluate(sel => document.querySelector(sel)?.innerText?.trim() ?? null, s);
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}); const E = [];
  // a visitor with some progress, and a signed-in player
  const V = await newContext(b); await ready(V.p); await V.p.evaluate(() => location.hash = '#/lesson/e-rules-1'); await w(V.p, 300); await V.p.click('[data-act="lesson-done"]'); await w(V.p, 600);
  const P = await newContext(b); await ready(P.p); await P.p.evaluate(() => window.__testGoogle('sam@example.com', 'Sam Test')); await w(P.p, 800);
  await P.p.evaluate(() => location.hash = '#/drill/e-d-10at6'); await w(P.p, 300); await P.p.click('.numpad button[data-n="3"]'); await w(P.p, 100); await P.p.click('.numpad button[data-n="3"]'); await w(P.p, 800);
  // the visitor opens #/admin
  await V.p.evaluate(() => location.hash = '#/admin'); await w(V.p, 300);
  console.log(`visitor admin page: sign-in prompt true ${!!await V.p.$('[data-act="signin"]')} | ${await text(V.p, 'h1')}`);
  const list = await V.p.evaluate(async () => { const { getDocs, collection } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'); const FB = window.__academyWeb.FB(); try { const s = await getDocs(collection(FB.db, 'academy')); return 'LISTED ' + s.size; } catch (e) { return e.code; } });
  console.log(`visitor cannot list players: ${list}`);
  // the admin signs in
  const Ad = await newContext(b); await ready(Ad.p); await Ad.p.evaluate(() => window.__testGoogle('samuelcblakey@gmail.com', 'Sam Blakey')); await w(Ad.p, 800);
  await Ad.p.evaluate(() => location.hash = '#/admin'); await Ad.p.waitForFunction(() => document.querySelectorAll('tbody tr').length >= 3, null, { timeout: 15000 }); await w(Ad.p, 300);
  const rows = await Ad.p.evaluate(() => [...document.querySelectorAll('tbody tr')].map(r => r.innerText.replace(/\s+/g, ' ')));
  console.log(`admin: players ${rows.length} | header ${await text(Ad.p, 'thead th')} | stats ${await text(Ad.p, '.stat b')}`);
  console.log(`admin sees sam@example.com: ${rows.some(r => r.includes('sam@example.com'))} | a visitor row: ${rows.some(r => r.startsWith('Visitor') && /device/i.test(r))}`);
  console.log(rows.join('\n'));
  E.push(...V.errs, ...P.errs, ...Ad.errs); console.log('errs', E); await b.close();
})();
