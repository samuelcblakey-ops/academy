// Google sign-in on the website: linking an anonymous account keeps its progress; a second device merges into the same account; sign out and back in.
const { chromium } = require('playwright');
const WEB = process.env.WEB_URL;
const newContext = async (b) => { const c = await b.newContext({ viewport: { width: 375, height: 812 } }); await c.addInitScript(() => { window.__ACADEMY_EMULATOR = true; }); const p = await c.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_|fonts|favicon|ytimg|youtube|emulator|400 \(Bad Request\)/i.test(m.text())) errs.push('console: ' + m.text()); });
  return { c, p, errs }; };
const ready = async p => { await p.goto(WEB); await p.waitForFunction(() => window.__academy && window.__academy.S.ready, null, { timeout: 20000 }); await p.waitForTimeout(300); };
const w = (p, ms) => p.waitForTimeout(ms);
const state = p => p.evaluate(() => { const S = window.__academy.S; const d = S.progress.drills['e-d-10at6']; return { lessons: Object.keys(S.progress.lessons).length, attempts: S.attempts.length, best: d ? `${d.best.made}/${d.best.of}` : null, n: d ? d.n : 0, anon: window.__academyWeb.AUTH.user.isAnonymous, name: window.__academyWeb.AUTH.user.displayName, email: window.__academyWeb.AUTH.user.email }; });
const doLesson = async (p, id) => { await p.evaluate(h => location.hash = h, '#/lesson/' + id); await w(p, 300); await p.click('[data-act="lesson-done"]'); await w(p, 400); };
const doDrill = async (p, a, b2) => { await p.evaluate(() => location.hash = '#/drill/e-d-10at6'); await w(p, 300); await p.click(`.numpad button[data-n="${a}"]`); await w(p, 100); await p.click(`.numpad button[data-n="${b2}"]`); await w(p, 800); };
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}); const E = [];
  const A = await newContext(b); await ready(A.p); await doLesson(A.p, 'e-rules-1'); await doDrill(A.p, 3, 2);
  const linked = await A.p.evaluate(() => window.__testGoogle('sam@example.com', 'Sam Test')); await w(A.p, 800);
  let s = await state(A.p); const uidA = await A.p.evaluate(() => window.__academyWeb.AUTH.user.uid);
  console.log(`linked: ${linked} | still has progress: lessons ${s.lessons} attempts ${s.attempts} | profile: ${s.name} ${s.email} anonymous ${s.anon}`);
  // device B: anonymous, does its own work, then signs in with the same Google account: progress merges
  const B = await newContext(b); await ready(B.p); await doLesson(B.p, 'e-rules-2'); await doDrill(B.p, 3, 3);
  const merged = await B.p.evaluate(() => window.__testGoogle('sam@example.com', 'Sam Test')); await B.p.waitForFunction(() => window.__academy.S.ready && !window.__academyWeb.AUTH.merging, null, { timeout: 15000 }); await w(B.p, 1200);
  s = await state(B.p);
  const cloudDoc = await B.p.evaluate(async uid => { const { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'); const FB = window.__academyWeb.FB(); const d = await getDoc(doc(FB.db, 'academy', uid)); return Object.keys(d.data().progress.lessons).length; }, uidA);
  console.log(`device B merged: ${merged} | lessons ${s.lessons} attempts ${s.attempts} drills e-d-10at6 best ${s.best} n ${s.n} | cloud doc lessons ${cloudDoc} | same uid ${await B.p.evaluate(() => window.__academyWeb.AUTH.user.uid) === uidA}`);
  // sign out: a fresh anonymous account with nothing in it
  await B.p.evaluate(() => location.hash = '#/more'); await w(B.p, 300); await B.p.click('[data-act="signout"]'); await B.p.waitForFunction(() => window.__academyWeb.AUTH.user && window.__academyWeb.AUTH.user.isAnonymous && window.__academy.S.ready, null, { timeout: 15000 }); await w(B.p, 500);
  s = await state(B.p); console.log(`signed out: anonymous ${s.anon} lessons ${s.lessons}`);
  const back = await B.p.evaluate(() => window.__testGoogle('sam@example.com', 'Sam Test')); await B.p.waitForFunction(() => window.__academy.S.ready && !window.__academyWeb.AUTH.user.isAnonymous, null, { timeout: 15000 }); await w(B.p, 1200);
  s = await state(B.p); console.log(`B signs back in: ${back} lessons ${s.lessons} attempts ${s.attempts}`);
  E.push(...A.errs, ...B.errs); console.log('errs', E); await b.close();
})();
