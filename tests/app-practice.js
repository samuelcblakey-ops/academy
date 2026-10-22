// Practice sessions: blocks in order, the quiz block, failing then passing, the level pass unlocking the next level, retake.
const open = require('./browser');
(async () => {
  const { p, errs, w, text, click, close } = await open();
  await p.evaluate(() => localStorage.clear()); await p.reload(); await w(300);
  await p.evaluate(() => location.hash = '#/practice/entry'); await w(200);
  console.log(`block 1: ${await text('.eyebrow')} | ${await text('h1')} | pad ${await p.evaluate(() => document.querySelectorAll('.numpad button').length)}`);
  await click('.numpad button[data-n="2"]'); await click('.numpad button[data-n="2"]', 200); // 4/10, pass mark 5: fail
  console.log(`block 1 result: ${await text('.result-card .big')} | next button: ${await text('[data-act="practice-next"]')} | no go-again: ${await p.evaluate(() => !document.querySelector('[data-act="run-again"]'))}`);
  await click('[data-act="practice-next"]', 200);
  console.log(`block 2: ${await text('.eyebrow')} | ${await text('h1')}`);
  await click('.numpad button[data-n="2"]', 200); await click('[data-act="practice-next"]', 200);
  console.log(`block 3: ${await text('.eyebrow')} | quiz q: ${await text('[data-quiz] .eyebrow')} | options ${await p.evaluate(() => document.querySelectorAll('.opt').length)}`);
  for (let i = 0; i < 4; i++) { // answer every question correctly
    const correct = await p.evaluate(() => { const Q = window.__academy.S.quiz; return Q.qs[Q.n].q.correct; });
    await click(`.opt[data-i="${correct}"]`); console.log(`  q${i + 1}: ${(await text('.notice b'))} | next: ${await text('[data-act="quiz-next"]')}`); await click('[data-act="quiz-next"]', 150);
  }
  console.log(`quiz done: ${await text('.result-card .big')} | next: ${await text('[data-act="practice-next"]')}`);
  await click('[data-act="practice-next"]', 300);
  console.log(`session: ${await text('h2')} | rows ${await p.evaluate(() => document.querySelectorAll('tbody tr').length)} | pills ${await p.evaluate(() => [...document.querySelectorAll('tbody .pill')].map(x => x.textContent).join(','))}`);
  let st = await p.evaluate(() => JSON.parse(localStorage.getItem('academy-v1')));
  console.log(`recorded: kinds ${st.attempts.map(a => a.kind).join(',')} | practice passed ${st.attempts.at(-1).passed} blocks ${st.attempts.at(-1).blocks.length} | level entry: ${JSON.stringify(st.progress.levels.entry).replace(/"at":\d+,?/g, '').replace(/,"last":.*$/, '}')} | in-session drill counted: ${st.progress.drills['e-d-10at6'].n}`);
  await click('[data-act="practice-retake"]', 300);
  console.log(`retake: ${await text('.eyebrow')} | ${await text('h1')}`);
  await click('.numpad button[data-n="3"]'); await click('.numpad button[data-n="3"]', 200); await click('[data-act="practice-next"]', 200);
  await click('.numpad button[data-n="2"]', 200); await click('[data-act="practice-next"]', 200);
  for (let i = 0; i < 4; i++) { const correct = await p.evaluate(() => { const Q = window.__academy.S.quiz; return Q.qs[Q.n].q.correct; }); await click(`.opt[data-i="${correct}"]`); await click('[data-act="quiz-next"]', 150); }
  await click('[data-act="practice-next"]', 300);
  console.log(`passed: ${await text('h2')} | next link: ${await text('a.btn.primary')} | toast: ${await text('#toast')}`);
  st = await p.evaluate(() => JSON.parse(localStorage.getItem('academy-v1')));
  console.log(`level entry passed: ${!!st.progress.levels.entry.passedAt} attempts ${st.progress.levels.entry.attempts} fails ${st.progress.levels.entry.fails}`);
  await p.evaluate(() => location.hash = '#/'); await w(200);
  console.log(`home: entry pill ${await text('.level.passed .pill')} | current ${await text('.level.now .lv-title b')} | entry line: ${(await p.evaluate(() => document.querySelector('.level.passed .small.muted:last-child').textContent))}`);
  await p.evaluate(() => location.hash = '#/level/beginners'); await w(200);
  console.log(`beginners practice open: ${await text('#practice a.btn.primary')}`);
  await p.evaluate(() => location.hash = '#/progress'); await w(200);
  console.log(`badges: ${await p.evaluate(() => [...document.querySelectorAll('.badge')].map(b => b.className.replace('badge', '').trim() || '-').join(','))}`);
  console.log('errs', errs); await close();
})();
