// Lesson quizzes: wrong answers explain themselves, results are recorded, scenes draw, and a quiz can be retaken.
const open = require('./browser');
(async () => {
  const { p, errs, w, text, click, close } = await open();
  await p.evaluate(() => localStorage.clear()); await p.reload(); await w(300);
  await p.evaluate(() => location.hash = '#/lesson/b-tact-2'); await w(200);
  console.log(`lesson: ${await text('h1')} | scene drawn: ${await p.evaluate(() => !!document.querySelector('svg.scene'))} | boules: ${await p.evaluate(() => document.querySelectorAll('svg.scene circle[r="7"]').length)}`);
  const wrong = await p.evaluate(() => { const Q = window.__academy.S.quiz; return (Q.qs[Q.n].q.correct + 1) % Q.qs[Q.n].q.a.length; });
  await click(`.opt[data-i="${wrong}"]`);
  console.log(`wrong: ${await text('.notice b')} | classes: wrong ${await p.evaluate(() => !!document.querySelector('.opt.wrong'))} right ${await p.evaluate(() => !!document.querySelector('.opt.right'))} | disabled ${await p.evaluate(() => [...document.querySelectorAll('.opt')].every(o => o.disabled))}`);
  await click('[data-act="quiz-next"]', 150);
  const correct = await p.evaluate(() => { const Q = window.__academy.S.quiz; return Q.qs[Q.n].q.correct; });
  await click(`.opt[data-i="${correct}"]`); console.log(`right: ${await text('.notice b')}`); await click('[data-act="quiz-next"]', 200);
  console.log(`done: ${await text('.result-card .big')} | ${await text('.result-card > div:nth-child(2)')} | again button: ${await text('[data-act="quiz-again"]')}`);
  const st = await p.evaluate(() => JSON.parse(localStorage.getItem('academy-v1')));
  console.log(`recorded: ${st.attempts[0].kind} ${st.attempts[0].quizId} ${st.attempts[0].made}/${st.attempts[0].of} passed ${st.attempts[0].passed} | quizzes ${JSON.stringify(st.progress.quizzes['lesson:b-tact-2']).replace(/"at":\d+,?/g, '')}`);
  await click('[data-act="quiz-again"]', 150);
  console.log(`again: ${await text('[data-quiz] .eyebrow')} | options ${await p.evaluate(() => document.querySelectorAll('.opt:not([disabled])').length)}`);
  console.log('errs', errs); await close();
})();
