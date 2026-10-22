// Phone layout: no sideways scrolling on any page, bottom tab bar with icons, touch-sized controls; desktop keeps the tab strip at the top.
const open = require('./browser');
(async () => {
  const L = []; let allErrs = [];
  for (const [wd, label] of [[375, 'phone'], [1100, 'desktop']]) {
    const { p, errs, w, close } = await open({ width: wd });
    await p.evaluate(() => localStorage.clear()); await p.reload(); await w(300);
    const widths = {};
    for (const h of ['#/', '#/level/beginners', '#/lesson/b-shoot-1', '#/drill/b-d-shoot6', '#/drill/x-d-precision', '#/practice/entry', '#/drills', '#/progress', '#/more']) { await p.evaluate(x => location.hash = x, h); await w(150); widths[h] = await p.evaluate(() => document.documentElement.scrollWidth); }
    const r = await p.evaluate(() => { const nav = document.querySelector('nav.tabs'), cs = getComputedStyle(nav);
      return { navFixed: cs.position === 'fixed', navBottom: Math.round(nav.getBoundingClientRect().bottom) === innerHeight, icons: getComputedStyle(nav.querySelector('.t-ic')).display !== 'none', header: Math.round(document.querySelector('header.app').getBoundingClientRect().height) }; });
    await p.evaluate(() => location.hash = '#/drill/b-d-shoot6'); await w(150);
    const touch = await p.evaluate(() => ({ pad: Math.min(...[...document.querySelectorAll('.numpad button')].map(b => b.getBoundingClientRect().height)) >= 44, btn: Math.min(...[...document.querySelectorAll('.btn:not(.sm)')].map(b => b.getBoundingClientRect().height)) >= 44 }));
    L.push(`${label}: ${JSON.stringify({ overflow: Math.max(...Object.values(widths)) > wd, ...r, touch })}`); allErrs = allErrs.concat(errs); await close();
  }
  console.log(L.join('\n')); console.log('errs', allErrs);
})();
