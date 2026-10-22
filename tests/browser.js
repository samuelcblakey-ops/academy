// Shared helpers for the browser tests: a headless Chromium at phone size, an error collector, and small waits.
const { chromium } = require('playwright');
module.exports = async function open({ width = 375, height = 812, url = process.env.APP_URL } = {}) {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const p = await b.newPage({ viewport: { width, height } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error' && !/ERR_|fonts|favicon|ytimg|youtube/.test(m.text())) errs.push('console: ' + m.text()); });
  await p.goto(url); await p.waitForTimeout(400);
  const w = ms => p.waitForTimeout(ms);
  const text = s => p.evaluate(sel => document.querySelector(sel)?.innerText?.trim() ?? null, s);
  const click = async (sel, ms = 80) => { await p.click(sel); await w(ms); };
  return { b, p, errs, w, text, click, close: () => b.close() };
};
