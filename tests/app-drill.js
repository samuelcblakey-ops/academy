// Drills: counted sets, undo, pass/fail against the pass mark, the precision (0/1/3/5) runner, and what gets recorded.
const open = require('./browser');
(async () => {
  const { p, errs, w, text, click, close } = await open();
  await p.evaluate(() => localStorage.clear()); await p.reload(); await w(300);
  await p.evaluate(() => location.hash = '#/drill/e-d-10at6'); await w(200);
  console.log(`drill: ${await text('h1')} | setup open: ${await p.evaluate(() => document.querySelector('details').open)} | pad buttons: ${await p.evaluate(() => document.querySelectorAll('.numpad button').length)} | prompt: ${await text('.eyebrow + div b')}`);
  await click('.numpad button[data-n="3"]'); console.log(`after set 1: ${await text('.setchip')} | now ${await text('.sets + div .eyebrow')}`);
  await click('[data-act="run-undo"]'); console.log(`undo: sets ${await p.evaluate(() => window.__academy.S.run.sets.length)}`);
  await click('.numpad button[data-n="3"]'); await click('.numpad button[data-n="2"]', 200);
  console.log(`result: ${await text('.result-card .big')} | ${(await text('.result-card > div:nth-child(3)')).split('·')[0].trim()} | panel ${await p.evaluate(() => document.querySelector('.result-card').className.includes('soft') ? 'pass' : 'fail')}`);
  const st = await p.evaluate(() => JSON.parse(localStorage.getItem('academy-v1')));
  console.log(`recorded: attempts ${st.attempts.length} kind ${st.attempts[0].kind} made ${st.attempts[0].made}/${st.attempts[0].of} passed ${st.attempts[0].passed} sets ${JSON.stringify(st.attempts[0].sets)} | stats ${JSON.stringify(st.progress.stats).replace(/"streakDay":"[^"]+"|,"lastAt":\d+/g, '')} | drill ${JSON.stringify(st.progress.drills['e-d-10at6'].best)}`.replace(/"at":\d+,?/g, ''));
  await click('[data-act="run-again"]'); await click('.numpad button[data-n="1"]'); await click('.numpad button[data-n="1"]', 200);
  console.log(`second go: ${await text('.result-card .big')} ${await p.evaluate(() => document.querySelector('.result-card').className.includes('bad') ? 'fail' : 'pass')} | best line: ${await text('.result-card .small.muted')}`);
  // precision drill
  await p.evaluate(() => location.hash = '#/drill/i-d-precision6'); await w(200);
  console.log(`precision: ${await text('h1')} | shots ${await p.evaluate(() => document.querySelectorAll('.shot').length)} | first: ${(await text('.shot.cur > div')).replace(/\s+/g, ' ')} | finish disabled: ${await p.evaluate(() => document.querySelector('[data-act="run-finish"]').disabled)}`);
  for (let i = 0; i < 10; i++) await click(`.shot:nth-child(${i + 1}) button[data-s="${[0, 1, 3, 5][i % 4]}"]`, 40);
  console.log(`scored: total ${await text('.big')} | finish enabled: ${await p.evaluate(() => !document.querySelector('[data-act="run-finish"]').disabled)}`);
  await click('[data-act="run-undo"]'); console.log(`undo last shot: ${await p.evaluate(() => window.__academy.S.run.shots[9])} total ${await text('.big')}`);
  await click('.shot:nth-child(10) button[data-s="5"]'); await click('[data-act="run-finish"]', 200);
  console.log(`precision result: ${await text('.result-card .big')} | ${await p.evaluate(() => document.querySelector('.result-card').className.includes('soft') ? 'pass' : 'fail')}`);
  const st2 = await p.evaluate(() => JSON.parse(localStorage.getItem('academy-v1')));
  console.log(`precision recorded: made ${st2.attempts[2].made}/${st2.attempts[2].of} boules ${st2.attempts[2].boules} shots ${JSON.stringify(st2.attempts[2].shots)} | totals attempts ${st2.progress.stats.attempts} boules ${st2.progress.stats.boules} passes ${st2.progress.stats.passes} fails ${st2.progress.stats.fails}`);
  // progress page
  await p.evaluate(() => location.hash = '#/progress'); await w(200);
  console.log(`progress: ${(await p.evaluate(() => [...document.querySelectorAll('.stat')].map(s => s.innerText.replace(/\n/g, ' ')).join(' | ')))}`);
  console.log(`drill rows: ${await p.evaluate(() => document.querySelectorAll('section table tbody tr').length)} | recent first: ${(await text('section:nth-of-type(2) tbody tr')).replace(/\s+/g, ' ')}`);
  console.log(`drills tab: ${await (async () => { await p.evaluate(() => location.hash = '#/drills'); await w(200); return (await p.evaluate(() => document.querySelectorAll('.lesson-row.drill').length)) + ' drills, ticks ' + (await p.evaluate(() => [...document.querySelectorAll('.lesson-row.drill .tick')].filter(t => t.textContent.trim()).length)); })()}`);
  console.log('errs', errs); await close();
})();
