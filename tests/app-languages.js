// Language menu: French translates the chrome (tabs, memorial, buttons), is remembered, and English comes back.
const open = require('./browser');
(async () => {
  const { p, errs, w, text, click, close } = await open();
  await p.evaluate(() => localStorage.clear()); await p.reload(); await w(300);
  console.log(`menu closed: ${await p.evaluate(() => document.querySelector('.lang-menu').hidden)}`);
  await click('[data-act="lang-menu"]'); console.log(`menu open: ${await p.evaluate(() => !document.querySelector('.lang-menu').hidden)} options ${await p.evaluate(() => document.querySelectorAll('.lang-menu button').length)}`);
  await click('.lang-menu [data-lang="fr"]', 200);
  console.log(`fr: ${await text('[data-act="lang-menu"]')} | ${await text('.memorial')} | tabs ${await p.evaluate(() => [...document.querySelectorAll('nav.tabs button')].map(b => b.textContent.trim()).join(','))} | continue ${await text('.panel.soft .eyebrow')} | level ${await text('.level .lv-title b')}`);
  await p.evaluate(() => location.hash = '#/drill/e-d-10at6'); await w(200);
  console.log(`fr drill: ${await text('.sets .setchip')} | ${await text('.eyebrow')} | pass ${await text('.spread .small.muted')}`);
  await p.reload(); await w(300); console.log(`remembered: ${await text('[data-act="lang-menu"]')}`);
  await p.evaluate(() => location.hash = '#/more'); await w(200); await click('main [data-lang="en"]', 200);
  console.log(`back to english: ${await text('.memorial')} | ${await p.evaluate(() => [...document.querySelectorAll('nav.tabs button')].map(b => b.textContent.trim()).join(','))}`);
  console.log('errs', errs); await close();
})();
