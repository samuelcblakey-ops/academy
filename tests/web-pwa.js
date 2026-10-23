// Installable app: manifest, icons, service worker registration, custom domain file.
const { chromium } = require('playwright');
const WEB = process.env.WEB_URL;
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}); const errs = [];
  const c = await b.newContext({ viewport: { width: 375, height: 812 } }); await c.addInitScript(() => { window.__ACADEMY_EMULATOR = true; window.__ACADEMY_TEST_SW = true; });
  const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto(WEB); await p.waitForFunction(() => window.__academy && window.__academy.S.ready, null, { timeout: 20000 });
  const m = await p.evaluate(async () => { const r = await fetch('manifest.webmanifest'); const j = await r.json(); const ic = await fetch(j.icons[0].src); return [r.ok, j.display, j.icons.length, j.icons.some(i => i.purpose === 'maskable'), ic.status, ic.headers.get('content-type'), !!document.querySelector('link[rel=manifest]')]; });
  console.log(`manifest: ${JSON.stringify(m)}`);
  const sw = await p.evaluate(async () => { const reg = await navigator.serviceWorker.getRegistration(); if (!reg) return false; await navigator.serviceWorker.ready; return !!(reg.active || reg.installing || reg.waiting); });
  console.log(`service worker: ${sw}`);
  console.log(`cname: ${(await p.evaluate(async () => (await fetch('CNAME')).status)) === 404 ? 'none' : 'present'}`); // no custom domain: the site lives at samuelcblakey-ops.github.io/academy/
  console.log('errs', errs); await b.close();
})();
