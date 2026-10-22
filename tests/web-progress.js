// Website against the emulators: anonymous sign-in, progress saved to the cloud per uid, isolation between devices, reload, offline saves.
const { chromium } = require('playwright');
const WEB = process.env.WEB_URL;
const newContext = async (b) => { const c = await b.newContext({ viewport: { width: 375, height: 812 } }); await c.addInitScript(() => { window.__ACADEMY_EMULATOR = true; }); const p = await c.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_|fonts|favicon|ytimg|youtube|emulator/i.test(m.text())) errs.push('console: ' + m.text()); });
  return { c, p, errs }; };
const ready = async p => { await p.goto(WEB); await p.waitForFunction(() => window.__academy && window.__academy.S.ready, null, { timeout: 20000 }); await p.waitForTimeout(300); };
const w = (p, ms) => p.waitForTimeout(ms);
const text = (p, s) => p.evaluate(sel => document.querySelector(sel)?.innerText?.trim() ?? null, s);
const cloud = (p, uid) => p.evaluate(async uid => { // read straight from Firestore via the app's own handle (same auth)
  const { getDoc, doc, getDocs, collection } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
  const FB = window.__academyWeb.FB(); try { const d = await getDoc(doc(FB.db, 'academy', uid)); const a = await getDocs(collection(FB.db, 'academy', uid, 'attempts')); return { doc: d.exists(), data: d.exists() ? d.data() : null, attempts: a.size }; } catch (e) { return { err: e.code || String(e) }; } }, uid);
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}); const E = [];
  const A = await newContext(b); await ready(A.p);
  const uidA = await A.p.evaluate(() => window.__academyWeb.AUTH.user.uid);
  console.log(`anonymous: ${await A.p.evaluate(() => window.__academyWeb.AUTH.user.isAnonymous)} uid ${uidA} | light: ${await A.p.evaluate(() => document.querySelector('.netdot').className.replace('netdot ', ''))} ${await text(A.p, '.netdot')}`);
  // a lesson and a drill on device A
  await A.p.evaluate(() => location.hash = '#/lesson/e-rules-1'); await w(A.p, 300); await A.p.click('[data-act="lesson-done"]'); await w(A.p, 400);
  await A.p.evaluate(() => location.hash = '#/drill/e-d-10at6'); await w(A.p, 300); await A.p.click('.numpad button[data-n="3"]'); await w(A.p, 100); await A.p.click('.numpad button[data-n="2"]'); await w(A.p, 800);
  let c = await cloud(A.p, uidA);
  console.log(`saved to cloud: doc ${c.doc} uid matches ${c.data?.uid === uidA} attempts ${c.attempts} | profile anonymous ${c.data?.profile?.anonymous}`);
  // device B: its own anonymous uid, sees nothing of A, cannot write to A
  const B = await newContext(b); await ready(B.p);
  const seesA = await cloud(B.p, uidA);
  const writeA = await B.p.evaluate(async uid => { const { setDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'); const FB = window.__academyWeb.FB(); try { await setDoc(doc(FB.db, 'academy', uid), { uid, hacked: true }, { merge: true }); return 'WROTE'; } catch (e) { return e.code; } }, uidA);
  console.log(`other device sees nothing of A: progress ${seesA.err ? 'null' : JSON.stringify(seesA.data)} attempts ${seesA.attempts ?? 0} | write to A denied: ${writeA}`);
  console.log(`B starts empty: lessons ${await B.p.evaluate(() => Object.keys(window.__academy.S.progress.lessons).length)} attempts ${await B.p.evaluate(() => window.__academy.S.attempts.length)}`);
  // A reloads: same uid, progress comes back from the cloud
  await ready(A.p);
  console.log(`same uid again: lessons ${await A.p.evaluate(() => Object.keys(window.__academy.S.progress.lessons).length)} attempts ${await A.p.evaluate(() => window.__academy.S.attempts.length)} drill best ${await A.p.evaluate(() => { const d = window.__academy.S.progress.drills['e-d-10at6']; return d.best.made + '/' + d.best.of; })}`);
  // offline: a result saves at once and syncs later
  await A.c.setOffline(true); await A.p.evaluate(() => { Object.defineProperty(navigator, 'onLine', { get: () => false, configurable: true }); dispatchEvent(new Event('offline')); }); await w(A.p, 200);
  await A.p.evaluate(() => location.hash = '#/drill/e-d-10at6'); await w(A.p, 300); await A.p.click('.numpad button[data-n="4"]'); await w(A.p, 100); await A.p.click('.numpad button[data-n="3"]'); await w(A.p, 500);
  console.log(`offline save: result shown ${await text(A.p, '.result-card .big')} | light ${await A.p.evaluate(() => document.querySelector('.netdot').className.replace('netdot ', ''))} ${await text(A.p, '.netdot')}`);
  await A.c.setOffline(false); await A.p.evaluate(() => { Object.defineProperty(navigator, 'onLine', { get: () => true, configurable: true }); dispatchEvent(new Event('online')); }); await A.p.waitForFunction(() => document.querySelector('.netdot').className.includes('live'), null, { timeout: 15000 }); await w(A.p, 500);
  c = await cloud(A.p, uidA);
  console.log(`back online: light ${await A.p.evaluate(() => document.querySelector('.netdot').className.replace('netdot ', ''))} | cloud attempts ${c.attempts}`);
  E.push(...A.errs, ...B.errs); console.log('errs', E); await b.close();
})();
