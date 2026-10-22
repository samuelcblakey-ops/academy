/* ---------------- web build: Firebase progress store, anonymous sign-in, Google link, admin view, PWA ---------------- */
// Every device signs in anonymously, so progress is saved to the cloud from the first drill with nothing to type.
// Signing in with Google links that anonymous account to the Google one, so the same progress opens on every device.
// Data: academy/{uid} holds the progress document; academy/{uid}/attempts/{id} holds every drill, quiz and session result.
const ADMIN_EMAILS = ["samuelcblakey@gmail.com"]; // site admins (enforced in firestore.rules too)
const CONFIGURED = firebaseConfig && firebaseConfig.apiKey && !String(firebaseConfig.apiKey).startsWith("PASTE");
const AUTH = { user: null, ready: false, error: null };
let FB = null, unsubProgress = null, unsubAttempts = null;
const isAdmin = () => !!(AUTH.user && !AUTH.user.isAnonymous && ADMIN_EMAILS.includes((AUTH.user.email || "").toLowerCase()));

// writes: count what's waiting for the server (for the connection light); offline, don't make the screen wait
const NET = { pending: 0 };
const netChanged = () => { try { renderHeader(); } catch {} };
const track = p => {
  NET.pending++; netChanged();
  const done = () => { NET.pending = Math.max(0, NET.pending - 1); netChanged(); }; p.then(done, done);
  if (navigator.onLine === false) { p.catch(e => { console.error(e); toast("A result saved offline couldn't be sent."); }); return Promise.resolve(); }
  return p;
};
S.connState = () => !FB ? null : navigator.onLine === false ? { k: "off", label: NET.pending ? `Offline · ${NET.pending} waiting to sync` : "Offline" } : NET.pending ? { k: "sync", label: "Saving…" } : { k: "live", label: "Live" };
addEventListener("online", netChanged); addEventListener("offline", netChanged);

function fbStore() {
  const { db } = FB; const me = () => AUTH.user.uid;
  const pdoc = () => doc(db, "academy", me()); const acol = () => collection(db, "academy", me(), "attempts");
  return {
    mode: "firebase",
    load() { // first snapshot wins: the cache answers at once offline, the server when online
      return new Promise(res => {
        const unsub = onSnapshot(pdoc(), { includeMetadataChanges: false }, async snap => {
          unsub();
          let attempts = [];
          try { const qs = await getDocs(query(acol(), orderBy("at"), limit(1000))); attempts = qs.docs.map(d => d.data()); } catch (e) { console.warn("attempts", e); }
          res({ progress: snap.exists() ? snap.data().progress : null, attempts });
        }, e => { console.error(e); unsub(); res({ progress: null, attempts: [] }); });
      });
    },
    saveProgress(p) {
      const u = AUTH.user; const profile = { name: u.isAnonymous ? null : (u.displayName || null), email: u.isAnonymous ? null : (u.email || null), anonymous: !!u.isAnonymous };
      return track(setDoc(pdoc(), { uid: me(), progress: clone(p), profile, updatedAt: Date.now() }, { merge: true }));
    },
    addAttempt(a) { return track(setDoc(doc(acol(), a.id), clone(a))); },
    async reset() {
      const qs = await getDocs(acol()); const ids = qs.docs.map(d => d.id);
      for (let i = 0; i < ids.length; i += 400) { const b = writeBatch(db); ids.slice(i, i + 400).forEach(id => b.delete(doc(acol(), id))); await b.commit(); }
    },
    watch() { // another device (or tab) saved: take its newer progress; keep the attempts list current
      unsubProgress?.(); unsubAttempts?.();
      unsubProgress = onSnapshot(pdoc(), snap => {
        if (!snap.exists() || snap.metadata.hasPendingWrites) return;
        const p = snap.data().progress; if (p && p.updatedAt > (S.progress.updatedAt || 0)) { S.progress = Object.assign(EMPTY(), p); S.progress.stats = Object.assign(EMPTY().stats, p.stats || {}); render(); }
      }, e => console.warn(e));
      unsubAttempts = onSnapshot(query(acol(), orderBy("at"), limit(1000)), snap => { S.attempts = snap.docs.map(d => d.data()); if (S.route.page === "progress") render(); }, e => console.warn(e));
      return () => { unsubProgress?.(); unsubAttempts?.(); };
    },
  };
}

// merging two progress records (when a device's anonymous progress joins an existing Google account)
function mergeProgress(a, b) {
  const out = EMPTY(); const max = (x, y) => Math.max(x || 0, y || 0);
  out.createdAt = Math.min(a.createdAt || Date.now(), b.createdAt || Date.now());
  for (const p of [a, b]) {
    Object.entries(p.lessons || {}).forEach(([k, v]) => { out.lessons[k] = Math.min(out.lessons[k] || v, v); });
    Object.entries(p.levels || {}).forEach(([k, v]) => { const o = out.levels[k] = out.levels[k] || { attempts: 0, fails: 0 }; o.attempts += v.attempts || 0; o.fails += v.fails || 0; if (v.passedAt) o.passedAt = o.passedAt ? Math.min(o.passedAt, v.passedAt) : v.passedAt; if (v.skipped) o.skipped = true; if (v.last && (!o.last || v.last.at > o.last.at)) o.last = v.last; });
    Object.entries(p.drills || {}).forEach(([k, v]) => { const o = out.drills[k] = out.drills[k] || { n: 0, passes: 0, fails: 0, best: null, last: null, hist: [] }; o.n += v.n || 0; o.passes += v.passes || 0; o.fails += v.fails || 0; if (v.best && (!o.best || v.best.made > o.best.made)) o.best = v.best; if (v.last && (!o.last || v.last.at > o.last.at)) o.last = v.last; o.hist = (o.hist || []).concat(v.hist || []).slice(-10); });
    Object.entries(p.quizzes || {}).forEach(([k, v]) => { const o = out.quizzes[k] = out.quizzes[k] || { n: 0, passes: 0, fails: 0, best: null, last: null }; o.n += v.n || 0; o.passes += v.passes || 0; o.fails += v.fails || 0; if (v.best && (!o.best || v.best.made / v.best.of > o.best.made / o.best.of)) o.best = v.best; if (v.last && (!o.last || v.last.at > o.last.at)) o.last = v.last; });
    const s = p.stats || {}; out.stats.attempts += s.attempts || 0; out.stats.passes += s.passes || 0; out.stats.fails += s.fails || 0; out.stats.boules += s.boules || 0;
    if ((s.streakDay || "") > (out.stats.streakDay || "")) { out.stats.streakDay = s.streakDay; out.stats.streak = s.streak || 0; } out.stats.lastAt = max(out.stats.lastAt, s.lastAt);
  }
  out.updatedAt = Date.now(); return out;
}

async function reloadData() {
  const d = await S.store.load();
  S.progress = Object.assign(EMPTY(), d.progress || {}); S.progress.stats = Object.assign(EMPTY().stats, S.progress.stats || {}); S.attempts = d.attempts || [];
  S.store.watch(); S.ready = true; render();
}

// sign in with Google: link the anonymous account (progress stays), or, if the Google account already exists, merge this device's progress into it
async function signInGoogle() {
  AUTH.error = null; const u = FB.auth.currentUser; const provider = new GoogleAuthProvider();
  try {
    if (u && u.isAnonymous) { await linkWithPopup(u, provider); AUTH.user = FB.auth.currentUser; await saveProgress(); toast("Signed in. Your progress is now on your Google account."); render(); return; }
    await signInWithPopup(FB.auth, provider);
  } catch (e) {
    if (e?.code === "auth/credential-already-in-use" || e?.code === "auth/email-already-in-use") {
      const cred = GoogleAuthProvider.credentialFromError(e); const local = { progress: clone(S.progress), attempts: S.attempts.slice() };
      try { await signInWithCredential(FB.auth, cred); } catch (e2) { console.error(e2); AUTH.error = "Sign-in didn't complete."; render(); return; }
      await mergeInto(local); return;
    }
    if (e?.code !== "auth/popup-closed-by-user" && e?.code !== "auth/cancelled-popup-request") { console.error(e); AUTH.error = "Sign-in didn't complete. Allow pop-ups for this site and try again."; render(); }
  }
}
async function mergeInto(local) { // called after switching to an existing Google account
  AUTH.merging = true;
  const d = await S.store.load();
  const merged = mergeProgress(d.progress || EMPTY(), local.progress);
  const have = new Set((d.attempts || []).map(a => a.id));
  for (const a of local.attempts) if (!have.has(a.id)) await S.store.addAttempt(a);
  S.progress = merged; S.attempts = (d.attempts || []).concat(local.attempts.filter(a => !have.has(a.id))).sort((x, y) => x.at - y.at);
  await saveProgress(); S.store.watch(); S.ready = true; AUTH.merging = false; render(); toast("Signed in. This device's progress was added to your account.", 4000);
}
S.auth = { get user() { return AUTH.user; }, get error() { return AUTH.error; }, signIn: signInGoogle, signOut: async () => { try { await signOut(FB.auth); } catch (e) { console.error(e); } } };

/* ---------- admin: every player's progress (admin sign-in only) ---------- */
const ADMIN = { rows: null, unsub: null, err: null };
function watchAdmin() {
  ADMIN.unsub?.(); if (!isAdmin()) { ADMIN.rows = null; return; }
  ADMIN.unsub = onSnapshot(query(collection(FB.db, "academy"), orderBy("updatedAt", "desc"), limit(500)), s => { ADMIN.rows = s.docs.map(d => d.data()); ADMIN.err = null; if (S.route.page === "admin") render(); }, e => { ADMIN.err = e.code || String(e); ADMIN.rows = []; if (S.route.page === "admin") render(); });
}
S.pages.admin = () => {
  if (!isAdmin()) return `<div class="stack"><h1>Admin</h1><div class="panel stack" style="gap:8px"><div>Sign in with the admin Google account to see every player's progress.</div><div class="row"><button type="button" class="btn primary" data-act="signin">Sign in with Google</button></div>${AUTH.error ? `<div class="notice" data-notr>${esc(AUTH.error)}</div>` : ""}</div></div>`;
  if (!ADMIN.rows) { watchAdmin(); return `<div class="stack"><h1>Admin</h1><div class="muted">Loading…</div></div>`; }
  const rows = ADMIN.rows; const tot = rows.reduce((t, r) => { const s = r.progress?.stats || {}; t.attempts += s.attempts || 0; t.passes += s.passes || 0; t.boules += s.boules || 0; return t; }, { attempts: 0, passes: 0, boules: 0 });
  const levelOf = p => { const passed = LEVELS.filter(l => p?.levels?.[l.id]?.passedAt); return passed.length ? passed[passed.length - 1].name : "–"; };
  return `<div class="stack"><h1>Admin</h1>
    <div class="stats"><div class="stat"><span class="eyebrow">Players</span><b>${rows.length}</b><span class="small muted">${rows.filter(r => !r.profile?.anonymous).length} signed in</span></div><div class="stat"><span class="eyebrow">Attempts</span><b>${tot.attempts}</b><span class="small muted">${tot.passes} passed</span></div><div class="stat"><span class="eyebrow">Boules thrown</span><b>${tot.boules}</b></div></div>
    ${ADMIN.err ? `<div class="notice" data-notr>${esc(ADMIN.err)}</div>` : ""}
    <div class="tw"><table><thead><tr><th>Player</th><th>Highest level passed</th><th class="n">Lessons</th><th class="n">Attempts</th><th class="n">Pass rate</th><th class="n">Boules</th><th>Last active</th></tr></thead><tbody>
      ${rows.map(r => { const p = r.progress || {}; const s = p.stats || {}; return `<tr><td data-notr>${esc(r.profile?.name || r.profile?.email || `Visitor ${String(r.uid || "").slice(0, 6)}`)}${r.profile?.anonymous ? ` <span class="pill">device</span>` : ""}</td><td>${esc(levelOf(p))}</td><td class="n">${Object.keys(p.lessons || {}).length}</td><td class="n">${s.attempts || 0}</td><td class="n">${s.attempts ? pct(s.passes || 0, s.attempts) + "%" : "–"}</td><td class="n">${s.boules || 0}</td><td>${r.updatedAt ? fmtDateTime(r.updatedAt) : ""}</td></tr>`; }).join("")}
    </tbody></table></div></div>`;
};

/* ---------- PWA: installable, opens offline ---------- */
const INSTALL = { prompt: null };
addEventListener("beforeinstallprompt", e => { e.preventDefault(); INSTALL.prompt = e; S.install = async () => { INSTALL.prompt.prompt(); try { await INSTALL.prompt.userChoice; } catch {} INSTALL.prompt = null; S.install = null; render(); }; if (S.ready) render(); });
if ("serviceWorker" in navigator && (location.protocol === "https:" || window.__ACADEMY_TEST_SW)) {
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(e => console.warn("Service worker not registered", e)));
}

/* ---------- boot ---------- */
function boot() {
  S.route = parseHash();
  if (!CONFIGURED) { S.store = localStore(); start(); setTimeout(() => toast("Firebase isn't set up yet, so this is saving on this device only."), 600); return; }
  const app = initializeApp(firebaseConfig);
  let db; try { db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) }); } catch (e) { console.warn("Offline cache unavailable", e); db = initializeFirestore(app, {}); }
  FB = { db, auth: getAuth(app) };
  if (window.__ACADEMY_EMULATOR) { // local testing only
    connectFirestoreEmulator(FB.db, "127.0.0.1", 8080); connectAuthEmulator(FB.auth, "http://127.0.0.1:9099", { disableWarnings: true });
    window.__testGoogle = async (email, name) => { const cred = GoogleAuthProvider.credential(JSON.stringify({ sub: email, email, email_verified: true, name })); const u = FB.auth.currentUser;
      if (u && u.isAnonymous) { try { await linkWithCredential(u, cred); AUTH.user = FB.auth.currentUser; await saveProgress(); render(); return "linked"; } catch (e) { if (e?.code === "auth/credential-already-in-use" || e?.code === "auth/email-already-in-use") { const local = { progress: clone(S.progress), attempts: S.attempts.slice() }; await signInWithCredential(FB.auth, cred); await mergeInto(local); return "merged"; } throw e; } }
      await signInWithCredential(FB.auth, cred); return "signed-in"; };
  }
  S.store = fbStore();
  onAuthStateChanged(FB.auth, async u => {
    if (!u) { try { await signInAnonymously(FB.auth); } catch (e) { console.error(e); toast("Couldn't connect. Check your internet connection and reload."); } return; }
    const switched = AUTH.user && AUTH.user.uid !== u.uid; AUTH.user = u; AUTH.ready = true;
    if (AUTH.merging) return; // mergeInto() loads and saves the combined progress itself
    if (!S.ready || switched) await reloadData(); else render();
    watchAdmin();
  });
}
boot();
window.__academyWeb = { AUTH, isAdmin, FB: () => FB, mergeProgress, reloadData };
