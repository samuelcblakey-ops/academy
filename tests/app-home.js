// Home, level and lesson pages: the level map, the Continue card, marking lessons done, and the click-to-play video.
const open = require('./browser');
(async () => {
  const { p, errs, w, text, click, close } = await open();
  await p.evaluate(() => localStorage.clear()); await p.reload(); await w(300);
  console.log(`levels: ${await p.evaluate(() => document.querySelectorAll('.level').length)} first: ${await text('.level .lv-title b')} pill: ${await text('.level .pill')}`);
  console.log(`continue: ${(await text('.panel.soft')).replace(/\n/g, ' | ')}`);
  await click('.level'); await w(100);
  console.log(`level page: ${await text('h1')} | strands ${await p.evaluate(() => document.querySelectorAll('section.strand').length)} | lessons ${await p.evaluate(() => document.querySelectorAll('.lesson-row:not(.drill)').length)} | drills ${await p.evaluate(() => document.querySelectorAll('.lesson-row.drill').length)}`);
  console.log(`practice panel: ${await text('#practice h2')} | start button: ${await p.evaluate(() => !!document.querySelector('#practice a.btn.primary'))}`);
  await click('.lesson-row:not(.drill)'); await w(100);
  console.log(`lesson: ${await text('h1')} | video thumb: ${await p.evaluate(() => !!document.querySelector('.video img') && !document.querySelector('.video iframe'))} | key points: ${await p.evaluate(() => document.querySelectorAll('.keypoints li').length)} | quiz: ${await p.evaluate(() => !!document.querySelector('[data-quiz]'))}`);
  await click('[data-act="play"]'); await w(100);
  console.log(`iframe after play: ${await p.evaluate(() => (document.querySelector('.video iframe')?.src || '').replace(/\?.*/, ''))}`);
  await click('[data-act="lesson-done"]'); await w(100);
  console.log(`done button: ${await text('[data-act="lesson-done"]')} | saved: ${await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('academy-v1')).progress.lessons).length)}`);
  await click('a.btn[href^="#/lesson/"]'); await w(120); // Next
  console.log(`next lesson: ${await text('h1')}`);
  await p.evaluate(() => location.hash = '#/'); await w(200);
  console.log(`home after one lesson: ${(await text('.level .small.muted')).replace(/\n/g, ' ')} | continue: ${(await text('.panel.soft .muted.small')).replace(/\n/g, ' | ')}`);
  console.log(`bar width: ${await p.evaluate(() => document.querySelector('.level .bar-fill').style.width)}`);
  await p.evaluate(() => location.hash = '#/level/beginners'); await w(200);
  console.log(`beginners locked: ${await p.evaluate(() => !!document.querySelector('[data-act="start-here"]'))} | notice: ${await text('#practice .notice')}`);
  await click('[data-act="start-here"]'); await w(150);
  console.log(`after start here: open ${await p.evaluate(() => !!document.querySelector('#practice a.btn.primary'))} | entry skipped: ${await p.evaluate(() => !!JSON.parse(localStorage.getItem('academy-v1')).progress.levels.entry?.skipped)}`);
  await p.evaluate(() => location.hash = '#/'); await w(200);
  console.log(`current level now: ${await p.evaluate(() => document.querySelector('.level.now .lv-title b').textContent)}`);
  console.log('errs', errs); await close();
})();
