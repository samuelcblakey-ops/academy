(() => {
"use strict";
/* ---------------- utilities ---------------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const clone = o => JSON.parse(JSON.stringify(o));
const now = () => Date.now();
const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const lsDel = k => { try { localStorage.removeItem(k); } catch {} };
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const dayKey = ts => { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const fmtDate = ts => new Date(ts).toLocaleDateString(LOCALES[I18N.lang], { day: "numeric", month: "short" });
const fmtDateTime = ts => new Date(ts).toLocaleString(LOCALES[I18N.lang], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/* ---------------- curriculum index ---------------- */
const C = window.CURRICULUM;
const LEVELS = C.levels.slice().sort((a, b) => a.order - b.order);
const LEVEL = Object.fromEntries(LEVELS.map(l => [l.id, l]));
const STRAND = Object.fromEntries(C.strands.map(s => [s.id, s]));
const LESSON = {}, DRILL = {};
LEVELS.forEach(l => { l.lessons.forEach(x => LESSON[x.id] = Object.assign({ levelId: l.id }, x)); l.drills.forEach(d => DRILL[d.id] = Object.assign({ levelId: l.id }, d)); });
const ATELIER = Object.fromEntries(C.ateliers);
const PRECISION_SCORES = [0, 1, 3, 5];

/* ---------------- languages (UI chrome only; lesson text stays in English for now) ---------------- */
const FR_TEXT = {
  "Academy": "Académie", "In loving memory of Steve Noel": "À la mémoire de Steve Noel", "Learn": "Apprendre", "Drills": "Exercices", "Progress": "Progrès", "More": "Plus",
  "Loading…": "Chargement…", "Sections": "Sections", "Language": "Langue", "Sign in": "Se connecter", "Sign out": "Se déconnecter", "Account": "Compte",
  "Continue": "Continuer", "Start": "Commencer", "Next lesson": "Leçon suivante", "Your level": "Votre niveau", "Levels": "Niveaux", "Level {n}": "Niveau {n}",
  "Passed": "Réussi", "Current": "En cours", "Outline": "Ébauche", "Skipped": "Passé", "Locked": "Verrouillé", "Draft standard": "Barème provisoire",
  "{n} of {n} lessons": "{1} leçons sur {2}", "{n} lessons": "{1} leçons", "{n} min": "{1} min", "Lesson": "Leçon", "Drill": "Exercice", "Practice session": "Séance pratique",
  "Mark as done": "Marquer comme vue", "Done": "Vue", "Key points": "À retenir", "Try the drill": "Faire l'exercice", "Quick quiz": "Petit quiz", "Watch on YouTube": "Voir sur YouTube",
  "Play video": "Lire la vidéo", "Previous": "Précédent", "Next": "Suivant", "Back to level": "Retour au niveau", "Setup": "Mise en place", "Tips": "Conseils",
  "Set {n} of {n}": "Série {1} sur {2}", "Set {n}": "Série {1}", "Set {n} of {n} · {n} boules": "Série {1} sur {2} · {3} boules", "How many {x}?": "Combien de {1} ?", "Running total {x}": "Total en cours {1}", "pass mark {n}": "seuil de réussite {1}", "Pass mark {n}": "Seuil de réussite {1}", "Finish": "Terminer", "Undo": "Annuler", "Go again": "Recommencer", "Save and back": "Enregistrer et revenir",
  "Pass mark": "Seuil de réussite", "Typical": "Moyenne", "Good": "Bon", "Best": "Record", "Last": "Dernier", "Attempts": "Tentatives", "Pass rate": "Taux de réussite",
  "Boules thrown": "Boules jouées", "Day streak": "Jours d'affilée", "Passed!": "Réussi !", "Not this time": "Pas cette fois", "Shot {n} of {n}": "Tir {1} sur {2}",
  "Total": "Total", "points": "points", "Question {n} of {n}": "Question {1} sur {2}", "Correct": "Exact", "Not quite": "Pas tout à fait", "Score": "Score",
  "Start practice session": "Commencer la séance", "Start here": "Commencer ici", "Retake": "Refaire", "Block {n} of {n}": "Bloc {1} sur {2}", "Next block": "Bloc suivant",
  "Session complete": "Séance terminée", "Level passed": "Niveau réussi", "Recent attempts": "Dernières tentatives", "Export progress": "Exporter les progrès",
  "Reset progress": "Réinitialiser", "Cancel": "Annuler", "Yes, reset": "Oui, réinitialiser", "Competition desk": "Bureau du concours", "About": "À propos",
  "Pointing": "Le point", "Shooting": "Le tir", "Tactics & game sense": "La tactique", "Rules & etiquette": "Règles et usages", "Mind & body": "Mental et physique",
  "Entry": "Découverte", "Beginners": "Débutant", "Intermediate": "Confirmé", "Expert": "Expert", "Pro": "Élite",
  "Live": "En ligne", "Saving…": "Enregistrement…", "Offline": "Hors ligne", "Offline · {n} waiting to sync": "Hors ligne · {1} en attente",
  "Pass the {x} session first": "Réussissez d'abord la séance {1}", "All levels": "Tous les niveaux", "Hits": "Touches", "Made": "Réussies", "Result": "Résultat",
  "Drill in a practice session": "Exercice en séance", "Quiz": "Quiz", "Install the app": "Installer l'application", "No attempts yet": "Aucune tentative pour l'instant",
  "This is my level": "C'est mon niveau", "Reading": "Lecture", "{n} m": "{1} m", "Today": "Aujourd'hui", "Yesterday": "Hier",
};
const LANGS = [["en", "English"], ["fr", "Français"]];
const LOCALES = { en: undefined, fr: "fr-FR" };
const savedLang = lsGet("academy-lang");
const I18N = { lang: LANGS.some(l => l[0] === savedLang) ? savedLang : "en", exact: null, re: null };
function i18nCompile() {
  if (I18N.exact) return;
  const exact = {}, re = [];
  for (const [k, v] of Object.entries(FR_TEXT)) {
    if (/\{[nx]\}/.test(k)) {
      const src = k.replace(/[.*+?^$()|[\]\\]/g, "\\$&").replace(/\{n\}/g, "([+\\-−]?\\d+)").replace(/\{x\}/g, "(.+?)");
      re.push([new RegExp("^" + src + "$"), v, k.replace(/\{[nx]\}/g, "").length]);
    } else exact[k] = v;
  }
  re.sort((a, b) => b[2] - a[2]); I18N.exact = exact; I18N.re = re;
}
function trCore(t, depth = 0) {
  i18nCompile();
  if (I18N.exact[t] !== undefined) return I18N.exact[t];
  for (const [re, v] of I18N.re) { const m = t.match(re); if (m) { const caps = m.slice(1).map(c => /^[+\-−]?\d+$/.test(c) ? c : (trCore(c, depth + 1) ?? c)); return v.replace(/\{(\d+)\}/g, (_, d) => caps[+d - 1] ?? ""); } }
  if (depth < 3) for (const sep of [" · ", ", ", " / "]) if (t.includes(sep)) { const parts = t.split(sep); const out = parts.map(p => trCore(p.trim(), depth + 1)); if (out.some(o => o != null)) return out.map((o, i) => o ?? parts[i]).join(sep); }
  return null;
}
function tr(s) {
  if (I18N.lang === "en" || !s) return s;
  const m = String(s).match(/^([\s·:]*)([\s\S]*?)([\s·:?!]*)$/); const core = m[2];
  if (!core || !/[A-Za-z]/.test(core)) return s;
  const r = trCore(core.replace(/\s+/g, " ")); return r == null ? s : m[1] + r + m[3];
}
function localize(root) {
  if (I18N.lang === "en" || !root) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement && n.parentElement.closest("textarea, script, style, [data-notr]") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  const nodes = []; let n; while ((n = w.nextNode())) nodes.push(n);
  nodes.forEach(n => { const v = tr(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; });
  root.querySelectorAll("[placeholder], [aria-label], [title]").forEach(el => ["placeholder", "aria-label", "title"].forEach(a => { if (el.hasAttribute(a)) { const v = tr(el.getAttribute(a)); if (v !== el.getAttribute(a)) el.setAttribute(a, v); } }));
}
document.documentElement.lang = I18N.lang;

/* ---------------- progress model ---------------- */
// progress: one document per player. attempts: one record per drill, quiz or practice session (the full history).
const EMPTY = () => ({ v: 1, lessons: {}, levels: {}, drills: {}, quizzes: {}, stats: { attempts: 0, passes: 0, fails: 0, boules: 0, streak: 0, streakDay: null, lastAt: null }, createdAt: now(), updatedAt: now() });
function localStore() {
  const KEY = "academy-v1";
  const read = () => { try { return JSON.parse(lsGet(KEY)) || null; } catch { return null; } };
  const write = d => lsSet(KEY, JSON.stringify(d));
  return {
    mode: "local",
    async load() { const d = read(); return { progress: d?.progress || EMPTY(), attempts: d?.attempts || [] }; },
    async saveProgress(p) { const d = read() || { attempts: [] }; d.progress = p; write(d); },
    async addAttempt(a) { const d = read() || { progress: EMPTY(), attempts: [] }; d.attempts.push(a); d.attempts = d.attempts.slice(-1000); write(d); },
    async reset() { lsDel(KEY); },
    watch() { return () => {}; },
  };
}

const S = { route: null, progress: EMPTY(), attempts: [], ready: false, run: null, quiz: null, langMenu: false, store: null, auth: null, video: null, pages: {}, install: null };

const levelProg = id => S.progress.levels[id] || {};
const levelPassed = id => !!levelProg(id).passedAt;
const levelSkipped = id => !!levelProg(id).skipped;
const levelIndex = id => LEVELS.findIndex(l => l.id === id);
const prevLevel = id => LEVELS[levelIndex(id) - 1] || null;
const nextLevel = id => LEVELS[levelIndex(id) + 1] || null;
const practiceOpen = id => { const p = prevLevel(id); return !p || levelPassed(p.id) || levelSkipped(p.id); };
const currentLevel = () => LEVELS.find(l => !levelPassed(l.id) && !levelSkipped(l.id)) || LEVELS[LEVELS.length - 1];
const lessonDone = id => !!S.progress.lessons[id];
const lessonsDone = l => l.lessons.filter(x => lessonDone(x.id)).length;
const strandLessons = (l, s) => l.lessons.filter(x => x.strand === s);
const drillStat = id => S.progress.drills[id] || { n: 0, passes: 0, fails: 0, best: null, last: null };
const drillMax = d => d.mode === "precision" ? d.shots.length * 5 : (d.sets || 1) * d.boules;
const quizBank = level => { const q = []; LEVELS.slice(0, levelIndex(level.id) + 1).forEach(l => l.lessons.forEach(x => (x.quiz || []).forEach((qq, i) => q.push({ lessonId: x.id, i, levelId: l.id, q: qq })))); return q; };
const levelQuizBank = level => { const q = []; level.lessons.forEach(x => (x.quiz || []).forEach((qq, i) => q.push({ lessonId: x.id, i, levelId: level.id, q: qq }))); return q; };
const practiceStat = id => { const L = levelProg(id); return { attempts: L.attempts || 0, fails: L.fails || 0, passedAt: L.passedAt || null, last: L.last || null }; };

async function saveProgress() { S.progress.updatedAt = now(); try { await S.store.saveProgress(S.progress); } catch (e) { console.error(e); toast("Couldn't save your progress."); } }
async function setLessonDone(id, on) { if (on) S.progress.lessons[id] = now(); else delete S.progress.lessons[id]; await saveProgress(); render(); }
function touchStreak(p, at) {
  const st = p.stats; const d = dayKey(at); if (st.streakDay === d) return;
  const y = dayKey(at - 86400000); st.streak = st.streakDay === y ? (st.streak || 0) + 1 : 1; st.streakDay = d;
}
// every result goes through here: the history record, the per-drill and per-level counters, and the totals
async function recordAttempt(a) {
  a.id = a.id || uid(); a.at = a.at || now();
  const p = S.progress; const st = p.stats;
  st.attempts++; if (a.passed) st.passes++; else st.fails++; st.boules += a.boules || 0; st.lastAt = a.at; touchStreak(p, a.at);
  if (a.kind === "drill") {
    const d = p.drills[a.drillId] = p.drills[a.drillId] || { n: 0, passes: 0, fails: 0, best: null, last: null, hist: [] };
    d.n++; if (a.passed) d.passes++; else d.fails++;
    const rec = { made: a.made, of: a.of, at: a.at, passed: a.passed };
    if (!d.best || a.made > d.best.made) d.best = rec; d.last = rec; d.hist = (d.hist || []).concat([a.passed ? 1 : 0]).slice(-10);
  } else if (a.kind === "quiz") {
    const q = p.quizzes[a.quizId] = p.quizzes[a.quizId] || { n: 0, passes: 0, fails: 0, best: null, last: null };
    q.n++; if (a.passed) q.passes++; else q.fails++; const rec = { made: a.made, of: a.of, at: a.at, passed: a.passed };
    if (!q.best || a.made / a.of > q.best.made / q.best.of) q.best = rec; q.last = rec;
  } else if (a.kind === "practice") {
    const L = p.levels[a.levelId] = p.levels[a.levelId] || { attempts: 0, fails: 0 };
    L.attempts++; if (a.passed) { if (!L.passedAt) L.passedAt = a.at; } else L.fails++;
    L.last = { at: a.at, passed: a.passed, blocks: a.blocks.map(b => ({ label: b.label, made: b.made, of: b.of, passed: b.passed })) };
  }
  S.attempts.push(a);
  try { await S.store.addAttempt(a); } catch (e) { console.error(e); toast("Couldn't save that result."); }
  await saveProgress();
}
async function setSkipped(levelId) { // "start here": everything below this level is marked as skipped, so its practice session opens
  LEVELS.slice(0, levelIndex(levelId)).forEach(l => { if (!levelPassed(l.id)) { const L = S.progress.levels[l.id] = S.progress.levels[l.id] || { attempts: 0, fails: 0 }; L.skipped = true; } });
  await saveProgress(); render();
}
async function resetProgress() { S.progress = EMPTY(); S.attempts = []; try { await S.store.reset(); } catch (e) { console.error(e); } await saveProgress(); S.run = null; S.quiz = null; closeModal(); go("#/"); toast("Progress reset."); }

/* ---------------- routing ---------------- */
function parseHash() {
  const h = (location.hash || "#/").replace(/^#\/?/, ""); const [page, id] = h.split("/");
  return { page: page || "home", id: id ? decodeURIComponent(id) : null };
}
function go(hash) { if (location.hash === hash) { S.route = parseHash(); render(); } else location.hash = hash; }
addEventListener("hashchange", () => { S.route = parseHash(); S.langMenu = false; S.video = null; scrollTo(0, 0); render(); });

/* ---------------- rendering ---------------- */
const toastT = { t: null };
function toast(msg, ms = 2600) { const el = $("#toast"); el.textContent = tr(msg); el.hidden = false; clearTimeout(toastT.t); toastT.t = setTimeout(() => el.hidden = true, ms); }
function modal(html) { $("#modal").innerHTML = `<div class="modal-bg" data-act="modal-bg"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`; localize($("#modal")); }
function closeModal() { $("#modal").innerHTML = ""; }
const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
const bar = (a, b, cls = "") => `<div class="bar-track" aria-hidden="true"><div class="bar-fill ${cls}" style="width:${pct(a, b)}%"></div></div>`;
const dots = hist => `<span class="dots" aria-label="last ${hist.length}">${hist.map(h => `<i class="${h ? "p" : "f"}"></i>`).join("")}</span>`;
const ICONS = {
  learn: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  drills: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>',
  progress: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg>',
  more: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>',
  play: '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
};
const TABS = [["home", "Learn", "learn"], ["drills", "Drills", "drills"], ["progress", "Progress", "progress"], ["more", "More", "more"]];
const tabFor = page => ({ home: "home", level: "home", lesson: "home", practice: "home", drills: "drills", drill: "drills", progress: "progress", more: "more", admin: "more" }[page] || "home");
function renderHeader() {
  const auth = S.auth; const net = S.connState ? S.connState() : null;
  $("#hdrtools").innerHTML = `
    ${net ? `<span class="netdot ${net.k}" role="status">${esc(net.label)}</span>` : ""}
    <div class="lang-wrap" data-notr><button type="button" class="btn sm" data-act="lang-menu" aria-haspopup="listbox" aria-expanded="${!!S.langMenu}" title="Language">${I18N.lang.toUpperCase()} ▾</button>
      <div class="lang-menu" role="listbox" ${S.langMenu ? "" : "hidden"}>${LANGS.map(([c, n]) => `<button type="button" role="option" data-lang="${c}" aria-selected="${I18N.lang === c}"><b>${c.toUpperCase()}</b><span>${n}</span></button>`).join("")}</div></div>
    ${auth ? `<button type="button" class="btn sm" data-act="account" title="Account">${auth.user && !auth.user.isAnonymous ? esc((auth.user.displayName || auth.user.email || "").split(" ")[0]) : "Sign in"}</button>` : ""}`;
  localize($("#hdrtools"));
  $(".memorial").textContent = tr("In loving memory of Steve Noel"); $(".brand small").textContent = tr("Academy");
  const cur = tabFor(S.route.page);
  $("#tabs").innerHTML = TABS.map(([k, label, ic]) => `<button type="button" data-tab="${k}" aria-current="${cur === k}"><span class="t-ic" aria-hidden="true">${ICONS[ic]}</span><span>${label}</span></button>`).join("");
  localize($("#tabs"));
}
function render() {
  if (!S.ready) return;
  renderHeader();
  const main = $("#main"); const r = S.route;
  const fn = { home: renderHome, level: renderLevel, lesson: renderLesson, drill: renderDrillPage, practice: renderPracticePage, drills: renderDrills, progress: renderProgress, more: renderMore }[r.page] || S.pages[r.page] || renderHome;
  main.innerHTML = fn(r) || "";
  localize(main);
}
const crumbs = parts => `<div class="crumbs">${parts.map(([t, h]) => h ? `<a href="${h}">${esc(t)}</a>` : `<span>${esc(t)}</span>`).join('<span aria-hidden="true">›</span>')}</div>`;
const levelPill = l => levelPassed(l.id) ? `<span class="pill done">Passed</span>` : levelSkipped(l.id) ? `<span class="pill">Skipped</span>` : currentLevel().id === l.id ? `<span class="pill now">Current</span>` : "";

/* ---------- home: the level map ---------- */
function renderHome() {
  const cur = currentLevel(); const next = cur.lessons.find(x => !lessonDone(x.id));
  const cont = next ? `<div class="panel soft stack" style="gap:8px"><div class="eyebrow">Continue</div><div class="spread"><div><b>${esc(cur.name)}</b> · ${esc(STRAND[next.strand].name)}<div class="muted small">${esc(next.title)} · ${next.minutes} min</div></div><a class="btn primary" href="#/lesson/${next.id}">${lessonsDone(cur) ? "Next lesson" : "Start"}</a></div></div>`
    : `<div class="panel soft stack" style="gap:8px"><div class="eyebrow">Continue</div><div class="spread"><div><b>${esc(cur.name)}</b><div class="muted small">All lessons done. Take the practice session to pass the level.</div></div><a class="btn primary" href="#/practice/${cur.id}">Practice session</a></div></div>`;
  return `<div class="stack">
    ${cont}
    <div><div class="eyebrow">Levels</div></div>
    <div class="levels">${LEVELS.map(l => {
      const done = lessonsDone(l), tot = l.lessons.length; const ps = practiceStat(l.id);
      return `<button type="button" class="level ${levelPassed(l.id) ? "passed" : ""} ${cur.id === l.id ? "now" : ""}" data-go="#/level/${l.id}">
        <span class="lv-n" aria-hidden="true">${l.order}</span>
        <span class="lv-main">
          <span class="lv-title"><b>${esc(l.name)}</b><span class="muted" data-notr>${esc(l.fr)}</span>${levelPill(l)}${l.outline ? `<span class="pill lock">Outline</span>` : ""}</span>
          <span class="muted small">${esc(l.tagline)}</span>
          ${bar(done, tot)}
          <span class="small muted">${done} of ${tot} lessons${ps.passedAt ? ` · practice passed ${fmtDate(ps.passedAt)}` : ps.attempts ? ` · practice ${ps.attempts} ${ps.attempts === 1 ? "attempt" : "attempts"}` : ""}</span>
        </span></button>`; }).join("")}</div>
  </div>`;
}

/* ---------- level page ---------- */
function drillRow(d, extra = "") {
  const st = drillStat(d.id);
  return `<button type="button" class="lesson-row drill" data-go="#/drill/${d.id}"><span class="tick" aria-hidden="true">${st.passes ? "✓" : ""}</span><span class="lr-main"><span class="lr-title">${esc(d.title)}</span><span class="lr-meta">Drill · ${d.distance ? `${d.distance} m · ` : ""}${st.n ? `best ${st.best.made}/${st.best.of} · ${st.n} ${st.n === 1 ? "attempt" : "attempts"}` : esc(d.metric)}${extra}</span></span>${st.hist?.length ? dots(st.hist) : ""}</button>`;
}
function renderLevel({ id }) {
  const l = LEVEL[id]; if (!l) return renderHome();
  const open = practiceOpen(l.id); const ps = practiceStat(l.id); const prev = prevLevel(l.id);
  const blocks = l.practice.blocks.map(b => `<li>${esc(b.label)}</li>`).join("");
  return `<div class="stack">
    ${crumbs([["Levels", "#/"], [l.name]])}
    <div><div class="row"><h1>Level ${l.order} · ${esc(l.name)}</h1>${levelPill(l)}</div><div class="muted" data-notr>${esc(l.fr)} · ${esc(l.tagline)}</div></div>
    <p class="prose" style="margin:0">${esc(l.summary)}</p>
    ${l.outline ? `<div class="notice">This level is an outline: lesson summaries, drills and a draft practice session. Full lessons and videos are on the way.</div>` : ""}
    ${l.strands.map(sid => { const ls = strandLessons(l, sid); const ds = l.drills.filter(d => d.strand === sid); const done = ls.filter(x => lessonDone(x.id)).length;
      return `<section class="strand"><div class="strand-h"><h3>${esc(STRAND[sid].name)}</h3>${bar(done, ls.length)}<span class="small muted">${done}/${ls.length}</span></div>
        ${ls.map(x => `<button type="button" class="lesson-row ${lessonDone(x.id) ? "done" : ""}" data-go="#/lesson/${x.id}"><span class="tick" aria-hidden="true">${lessonDone(x.id) ? "✓" : ""}</span><span class="lr-main"><span class="lr-title">${esc(x.title)}</span><span class="lr-meta">Lesson · ${x.minutes} min${x.video ? " · video" : ""}${x.quiz ? " · quiz" : ""}</span></span></button>`).join("")}
        ${ds.map(d => drillRow(d)).join("")}</section>`; }).join("")}
    <section class="panel stack" id="practice" style="gap:12px">
      <div class="spread"><h2>${esc(l.practice.title)}</h2>${l.practice.draft ? `<span class="pill lock">Draft standard</span>` : ""}${ps.passedAt ? `<span class="pill done">Passed ${fmtDate(ps.passedAt)}</span>` : ""}</div>
      <p style="margin:0">${esc(l.practice.intro)}</p>
      <ul style="margin:0;padding-left:20px">${blocks}</ul>
      ${ps.attempts ? `<div class="small muted">${ps.attempts} ${ps.attempts === 1 ? "attempt" : "attempts"}${ps.fails ? `, ${ps.fails} not passed` : ""}${ps.last ? ` · last ${fmtDate(ps.last.at)}: ${ps.last.passed ? "passed" : "not passed"}` : ""}</div>` : ""}
      ${open ? `<a class="btn primary" href="#/practice/${l.id}">${ps.attempts ? "Retake" : "Start practice session"}</a>`
        : `<div class="notice">Pass the ${esc(prev.name)} session first, or tell the Academy this is already your level.</div><div class="row"><a class="btn" href="#/practice/${prev.id}">${esc(prev.name)} session</a><button type="button" class="btn" data-act="start-here" data-level="${l.id}">This is my level</button></div>`}
    </section>
  </div>`;
}

/* ---------- lesson page ---------- */
function bodyHtml(body) {
  return body.map(b => typeof b === "string" ? `<p>${esc(b)}</p>` : b.h ? `<h3>${esc(b.h)}</h3>` : b.list ? `<ul>${b.list.map(i => `<li>${esc(i)}</li>`).join("")}</ul>` : b.tip ? `<div class="tipbox">${esc(b.tip)}</div>` : "").join("");
}
function videoHtml(v, lessonId) {
  if (!v) return "";
  const url = `https://www.youtube.com/watch?v=${encodeURIComponent(v.id)}`;
  const playing = S.video === lessonId;
  return `<div class="stack" style="gap:6px"><div class="video" data-notr>${playing
    ? `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}?autoplay=1&rel=0" title="${esc(v.title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>`
    : `<img src="https://i.ytimg.com/vi/${encodeURIComponent(v.id)}/hqdefault.jpg" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" loading="lazy"><button type="button" class="vplay" data-act="play" data-lesson="${lessonId}"><span class="vp-ic">${ICONS.play}</span><b>${esc(v.title)}</b><span class="small">${esc(v.channel)}${v.lang && v.lang !== "en" ? ` · in ${v.lang === "fr" ? "French" : v.lang}` : ""}</span></button>`}</div>
    <div class="small muted spread"><span data-notr>${esc(v.channel)}</span><a href="${url}" target="_blank" rel="noopener">Watch on YouTube ↗</a></div></div>`;
}
function renderLesson({ id }) {
  const x = LESSON[id]; if (!x) return renderHome();
  const l = LEVEL[x.levelId]; const i = l.lessons.findIndex(y => y.id === id); const prev = l.lessons[i - 1], next = l.lessons[i + 1];
  const d = x.drill && DRILL[x.drill]; const done = lessonDone(id);
  return `<div class="stack">
    ${crumbs([["Levels", "#/"], [l.name, `#/level/${l.id}`], [STRAND[x.strand].name]])}
    <div><h1>${esc(x.title)}</h1><div class="muted small">Lesson · ${x.minutes} min · ${esc(STRAND[x.strand].name)}</div></div>
    ${videoHtml(x.video, id)}
    <div class="prose">${bodyHtml(x.body)}</div>
    ${x.keyPoints?.length ? `<div class="keypoints"><div class="eyebrow">Key points</div><ul>${x.keyPoints.map(k => `<li>${esc(k)}</li>`).join("")}</ul></div>` : ""}
    ${d ? `<div class="panel spread"><div><div class="eyebrow">Drill</div><b>${esc(d.title)}</b><div class="small muted">${esc(d.metric)}</div></div><a class="btn primary" href="#/drill/${d.id}">Try the drill</a></div>` : ""}
    ${x.quiz ? `<section class="panel stack" style="gap:12px"><h3>Quick quiz</h3>${quizHtml(`lesson:${id}`, x.quiz.map((q, qi) => ({ lessonId: id, i: qi, q })), Math.max(1, x.quiz.length), { inline: true })}</section>` : ""}
    <div class="row"><button type="button" class="btn ${done ? "" : "primary"}" data-act="lesson-done" data-lesson="${id}" aria-pressed="${done}">${done ? "✓ Done" : "Mark as done"}</button></div>
    <div class="spread"><div>${prev ? `<a class="btn" href="#/lesson/${prev.id}">← Previous</a>` : `<a class="btn" href="#/level/${l.id}">Back to level</a>`}</div><div>${next ? `<a class="btn" href="#/lesson/${next.id}">Next →</a>` : `<a class="btn primary" href="#/practice/${l.id}">Practice session</a>`}</div></div>
  </div>`;
}

/* ---------- scenes: a top-down piste for tactics questions ---------- */
function sceneSvg(sc) {
  const L = sc.len || 10, PX = 36, TOP = 22, W = L * PX + 40, H = 3 * PX + TOP + 14; const X = y => 20 + y * PX, Y = x => TOP + (1.5 + x) * PX; // y along the piste, x across it
  const boule = ([x, y], cls) => `<circle cx="${X(y)}" cy="${Y(x)}" r="7" fill="${cls === "a" ? "var(--accent)" : "var(--ink)"}" stroke="var(--surface)" stroke-width="1.5"/>`;
  return `<svg class="scene" viewBox="0 0 ${W} ${H}" role="img" aria-label="Diagram of the end"><rect x="20" y="${TOP}" width="${L * PX}" height="${3 * PX}" fill="var(--surface)" stroke="var(--wire)"/>
    ${[...Array(L + 1).keys()].map(m => `<line x1="${X(m)}" y1="${TOP}" x2="${X(m)}" y2="${TOP + 3 * PX}" stroke="var(--line)" stroke-dasharray="2 4"/>${m && m % 2 === 0 ? `<text x="${X(m)}" y="${H - 3}" font-size="9" fill="var(--muted)" text-anchor="middle">${m} m</text>` : ""}`).join("")}
    <circle cx="${X(0)}" cy="${Y(0)}" r="${0.25 * PX}" fill="none" stroke="var(--muted)" stroke-width="2"/>
    ${(sc.b || []).map(p => boule(p, "b")).join("")}${(sc.a || []).map(p => boule(p, "a")).join("")}
    <circle cx="${X(sc.jack[1])}" cy="${Y(sc.jack[0])}" r="4" fill="var(--jack)" stroke="var(--jack-ink)"/>
    <g font-size="10" fill="var(--muted)"><circle cx="26" cy="11" r="4" fill="var(--accent)"/><text x="33" y="14">you</text><circle cx="66" cy="11" r="4" fill="var(--ink)"/><text x="73" y="14">them</text><circle cx="110" cy="11" r="3" fill="var(--jack)"/><text x="117" y="14">jack</text><circle cx="152" cy="11" r="4" fill="none" stroke="var(--muted)" stroke-width="1.5"/><text x="159" y="14">circle</text></g></svg>`;
}

/* ---------- quiz runner (inline in lessons, and as a practice block) ---------- */
// S.quiz = { key, qs: [{lessonId,i,q}], n: index, answers: [idx], done }
function startQuiz(key, qs, count) { S.quiz = { key, qs: shuffle(qs).slice(0, count), n: 0, picked: null, answers: [], done: false }; }
function quizHtml(key, qs, count, { inline = false } = {}) {
  if (!S.quiz || S.quiz.key !== key) startQuiz(key, qs, count);
  const Q = S.quiz;
  if (Q.done) {
    const made = Q.answers.filter((a, i) => a === Q.qs[i].q.correct).length;
    return `<div class="result-card"><div class="big">${made}<small>/${Q.qs.length}</small></div><div>${made === Q.qs.length ? "All correct." : `${Q.qs.length - made} to look at again.`}</div>${inline ? `<button type="button" class="btn" data-act="quiz-again" data-key="${esc(key)}">Go again</button>` : ""}</div>`;
  }
  const cur = Q.qs[Q.n]; const q = cur.q; const picked = Q.picked;
  return `<div class="stack" style="gap:10px" data-quiz="${esc(key)}">
    <div class="eyebrow">Question ${Q.n + 1} of ${Q.qs.length}${inline ? "" : ` · <span data-notr>${esc(LESSON[cur.lessonId].title)}</span>`}</div>
    ${q.scene ? sceneSvg(q.scene) : ""}
    <div><b>${esc(q.q)}</b></div>
    <div class="stack" style="gap:6px">${q.a.map((opt, i) => `<button type="button" class="opt ${picked == null ? "" : i === q.correct ? "right" : i === picked ? "wrong" : ""}" data-act="quiz-pick" data-key="${esc(key)}" data-i="${i}" ${picked != null ? "disabled" : ""}><span class="ol">${"ABCD"[i]}</span><span>${esc(opt)}</span></button>`).join("")}</div>
    ${picked != null ? `<div class="notice ${picked === q.correct ? "good" : ""}"><b>${picked === q.correct ? "Correct" : "Not quite"}.</b> ${esc(q.why)}</div><div class="row"><button type="button" class="btn primary" data-act="quiz-next" data-key="${esc(key)}">${Q.n + 1 < Q.qs.length ? "Next" : "Finish"}</button></div>` : ""}
  </div>`;
}

/* ---------- drill runner ---------- */
// A "block" is one drill with a given number of sets and boules (or shots for precision drills) and a pass mark, or a quiz.
// S.run = { kind: "drill" | "practice", ... } ; for a drill: { drillId, sets:[made...], nsets, boules, pass, mode, shots:[score|null], done, result }
function blockSpec(b) {
  if (b.quiz) return { quiz: true, count: b.count, pass: b.pass, label: b.label };
  const d = DRILL[b.drill]; return { drillId: d.id, mode: d.mode || "count", nsets: b.sets || d.sets || 1, boules: b.boules || d.boules, pass: b.pass ?? d.pass, shots: d.shots, label: b.label || d.title };
}
function newRun(spec) { const r = Object.assign({}, spec, { sets: [], done: false, result: null, startedAt: now() }); r.shots = spec.shots ? spec.shots.map(() => null) : null; return r; } // shots: one score per shot, scored as you go
function runTotals(r) {
  if (r.mode === "precision") { const made = r.shots.reduce((a, v) => a + (v || 0), 0); return { made, of: r.shots.length * 5, boules: r.shots.filter(v => v != null).length }; }
  const made = r.sets.reduce((a, v) => a + v, 0); return { made, of: r.nsets * r.boules, boules: r.sets.length * r.boules };
}
function runComplete(r) { return r.mode === "precision" ? r.shots.every(v => v != null) : r.sets.length >= r.nsets; }
function finishRun(r) { const t = runTotals(r); r.done = true; r.result = { made: t.made, of: t.of, boules: t.boules, passed: t.made >= r.pass, pass: r.pass }; return r.result; }
function runnerHtml(r, { practice = false } = {}) {
  const d = DRILL[r.drillId]; const t = runTotals(r);
  if (r.done) {
    const res = r.result; const st = drillStat(d.id);
    return `<div class="panel ${res.passed ? "soft" : "bad"} result-card"><div class="eyebrow">Result</div><div class="big">${res.made}<small>/${res.of}</small></div>
      <div><b>${res.passed ? "Passed!" : "Not this time"}</b> · pass mark ${res.pass}${d.benchmark ? ` · typical ${d.benchmark.typical} · good ${d.benchmark.good}` : ""}</div>
      ${st.n ? `<div class="small muted">Best ${st.best.made}/${st.best.of} · ${st.n} ${st.n === 1 ? "attempt" : "attempts"} ${dots(st.hist || [])}</div>` : ""}
      ${practice ? "" : `<div class="row"><button type="button" class="btn primary" data-act="run-again">Go again</button><a class="btn" href="#/level/${d.levelId}">Back to level</a></div>`}</div>`;
  }
  if (r.mode === "precision") {
    const cur = r.shots.findIndex(v => v == null);
    return `<div class="stack" style="gap:10px">
      <div class="spread"><div class="eyebrow">Shot ${Math.min(cur + 1, r.shots.length)} of ${r.shots.length}</div><div class="big" style="font-size:30px">${t.made} <small>points</small></div></div>
      <div class="shots">${r.shots.map((v, i) => { const [k, dist] = d.shots[i]; return `<div class="shot ${i === cur ? "cur" : ""}"><div><b data-notr>${k}</b> · ${esc(ATELIER[k])} · ${dist} m</div><div class="sc-btns">${PRECISION_SCORES.map(s => `<button type="button" class="${v === s ? "on" : ""}" data-act="shot" data-i="${i}" data-s="${s}" aria-label="${s} points">${s}</button>`).join("")}</div></div>`; }).join("")}</div>
      <div class="row"><button type="button" class="btn" data-act="run-undo" ${r.shots.some(v => v != null) ? "" : "disabled"}>Undo</button><button type="button" class="btn primary" data-act="run-finish" ${runComplete(r) ? "" : "disabled"}>Finish</button></div></div>`;
  }
  const cur = r.sets.length; const metric = d.metric;
  return `<div class="stack" style="gap:10px">
    <div class="sets">${[...Array(r.nsets).keys()].map(i => `<span class="setchip ${i === cur ? "cur" : ""}">Set ${i + 1}${r.sets[i] != null ? `: <b>${r.sets[i]}</b>/${r.boules}` : ""}</span>`).join("")}</div>
    <div><div class="eyebrow">Set ${Math.min(cur + 1, r.nsets)} of ${r.nsets} · ${r.boules} boules</div><div><b>How many ${esc(metric)}?</b></div></div>
    <div class="numpad">${[...Array(r.boules + 1).keys()].map(n => `<button type="button" data-act="set" data-n="${n}">${n}</button>`).join("")}</div>
    <div class="spread"><div class="small muted">Running total ${t.made}/${t.of} · pass mark ${r.pass}</div><div class="row"><button type="button" class="btn sm" data-act="run-undo" ${r.sets.length ? "" : "disabled"}>Undo</button></div></div></div>`;
}
function renderDrillPage({ id }) {
  const d = DRILL[id]; if (!d) return renderDrills();
  if (!S.run || S.run.kind !== "drill" || S.run.drillId !== id) S.run = Object.assign(newRun(blockSpec({ drill: id })), { kind: "drill" });
  const l = LEVEL[d.levelId]; const st = drillStat(id);
  return `<div class="stack">
    ${crumbs([["Levels", "#/"], [l.name, `#/level/${l.id}`], [STRAND[d.strand].name]])}
    <div><div class="row"><h1>${esc(d.title)}</h1>${d.distance ? `<span class="pill">${d.distance} m</span>` : ""}</div><div class="muted small">Drill · ${esc(d.metric)} · pass mark ${d.pass}${st.n ? ` · best ${st.best.made}/${st.best.of}` : ""}</div></div>
    <details class="panel" ${st.n ? "" : "open"}><summary style="cursor:pointer;font-weight:600">Setup</summary><ul style="margin:8px 0 0;padding-left:20px">${d.setup.map(s => `<li>${esc(s)}</li>`).join("")}</ul>${d.tips?.length ? `<div class="eyebrow" style="margin-top:10px">Tips</div><ul style="margin:4px 0 0;padding-left:20px">${d.tips.map(s => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}</details>
    ${runnerHtml(S.run)}
  </div>`;
}
function renderDrills() {
  return `<div class="stack"><h1>Drills</h1><p class="muted" style="margin:0">Every drill in the Academy, by level. Results count towards your progress wherever you run them.</p>
    ${LEVELS.map(l => `<section class="strand"><div class="strand-h"><h3>Level ${l.order} · ${esc(l.name)}</h3></div>${l.drills.map(d => drillRow(d)).join("")}</section>`).join("")}</div>`;
}

/* ---------- practice session ---------- */
// S.run = { kind:"practice", levelId, i, blocks:[spec with result], cur: run for the current block, finished, passed }
function renderPracticePage({ id }) {
  const l = LEVEL[id]; if (!l) return renderHome();
  if (!S.run || S.run.kind !== "practice" || S.run.levelId !== id) S.run = { kind: "practice", levelId: id, i: 0, blocks: l.practice.blocks.map(blockSpec), cur: null, finished: false, passed: false, startedAt: now() };
  const R = S.run;
  if (!practiceOpen(id)) return `<div class="stack">${crumbs([["Levels", "#/"], [l.name, `#/level/${l.id}`], ["Practice session"]])}<div class="notice">Pass the ${esc(prevLevel(id).name)} session first.</div><a class="btn" href="#/level/${id}">Back to level</a></div>`;
  if (R.finished) {
    return `<div class="stack">${crumbs([["Levels", "#/"], [l.name, `#/level/${l.id}`], ["Practice session"]])}
      <div class="panel ${R.passed ? "soft" : "bad"} stack" style="gap:10px"><div class="eyebrow">Session complete</div><h2>${R.passed ? `Level passed: ${esc(l.name)}` : "Not this time"}</h2>
        <div class="tw"><table><thead><tr><th>Block</th><th class="n">Result</th><th class="n">Pass mark</th><th></th></tr></thead><tbody>${R.blocks.map(b => `<tr><td style="white-space:normal">${esc(b.label)}</td><td class="n">${b.result.made}/${b.result.of}</td><td class="n">${b.pass}</td><td>${b.result.passed ? `<span class="pill done">Passed</span>` : `<span class="pill fail">Missed</span>`}</td></tr>`).join("")}</tbody></table></div>
        ${R.passed ? (nextLevel(id) ? `<div>Next: <b>${esc(nextLevel(id).name)}</b>.</div>` : `<div>That's every level in the Academy.</div>`) : `<div>Pass every block in one session to complete the level. The blocks you passed still count in your drill history.</div>`}
        <div class="row">${R.passed && nextLevel(id) ? `<a class="btn primary" href="#/level/${nextLevel(id).id}">Go to ${esc(nextLevel(id).name)}</a>` : `<button type="button" class="btn primary" data-act="practice-retake">Retake</button>`}<a class="btn" href="#/level/${id}">Back to level</a></div></div></div>`;
  }
  const b = R.blocks[R.i];
  if (!R.cur) {
    if (b.quiz) { const key = `practice:${id}:${R.i}`; startQuiz(key, levelQuizBank(l).length >= b.count ? levelQuizBank(l) : quizBank(l), b.count); R.cur = { quiz: true, key }; }
    else R.cur = newRun(b);
  }
  let body;
  if (b.quiz) {
    if (!S.quiz || S.quiz.key !== R.cur.key) startQuiz(R.cur.key, levelQuizBank(l).length >= b.count ? levelQuizBank(l) : quizBank(l), b.count); // e.g. after reading a lesson mid-session
    body = quizHtml(R.cur.key, [], b.count);
  } else {
    const d = DRILL[b.drillId];
    body = `<details class="panel"><summary style="cursor:pointer;font-weight:600">Setup: ${esc(d.title)}</summary><ul style="margin:8px 0 0;padding-left:20px">${d.setup.map(s => `<li>${esc(s)}</li>`).join("")}</ul></details>${runnerHtml(R.cur, { practice: true })}`;
  }
  return `<div class="stack">
    ${crumbs([["Levels", "#/"], [l.name, `#/level/${l.id}`], ["Practice session"]])}
    <div><div class="eyebrow">Block ${R.i + 1} of ${R.blocks.length}${l.practice.draft ? " · draft standard" : ""}</div><h1>${esc(b.label)}</h1></div>
    ${bar(R.blocks.filter(x => x.result).length, R.blocks.length, "jack")}
    ${body}
    ${b.result ? `<div class="row"><button type="button" class="btn primary" data-act="practice-next">${R.i + 1 < R.blocks.length ? "Next block" : "Finish"}</button></div>` : ""}
  </div>`;
}
async function practiceBlockDone(result) { // record the block as a drill or quiz attempt, then show the Next button
  const R = S.run; const b = R.blocks[R.i]; b.result = result;
  if (b.quiz) await recordAttempt({ kind: "quiz", quizId: `practice:${R.levelId}`, levelId: R.levelId, made: result.made, of: result.of, pass: b.pass, passed: result.passed, practice: R.levelId, questions: result.questions });
  else await recordAttempt({ kind: "drill", drillId: b.drillId, levelId: DRILL[b.drillId].levelId, mode: b.mode, made: result.made, of: result.of, boules: result.boules, pass: b.pass, passed: result.passed, sets: R.cur.sets?.slice(), shots: R.cur.shots?.slice(), practice: R.levelId });
  render();
}
async function practiceAdvance() {
  const R = S.run; if (R.i + 1 < R.blocks.length) { R.i++; R.cur = null; render(); return; }
  R.finished = true; R.passed = R.blocks.every(b => b.result?.passed);
  await recordAttempt({ kind: "practice", levelId: R.levelId, passed: R.passed, made: R.blocks.filter(b => b.result.passed).length, of: R.blocks.length, boules: 0, blocks: R.blocks.map(b => ({ label: b.label, drillId: b.drillId || null, quiz: !!b.quiz, made: b.result.made, of: b.result.of, pass: b.pass, passed: b.result.passed })), durationSec: Math.round((now() - R.startedAt) / 1000) });
  if (R.passed) toast(`Level passed: ${LEVEL[R.levelId].name}!`, 4000);
  render();
}

/* ---------- progress ---------- */
function renderProgress() {
  const st = S.progress.stats; const rate = st.attempts ? pct(st.passes, st.attempts) : null;
  const drillsUsed = Object.keys(S.progress.drills).map(id => DRILL[id]).filter(Boolean).sort((a, b) => LEVEL[a.levelId].order - LEVEL[b.levelId].order);
  const recent = S.attempts.slice(-15).reverse();
  const streakLive = st.streakDay && (st.streakDay === dayKey(now()) || st.streakDay === dayKey(now() - 86400000));
  return `<div class="stack"><h1>Progress</h1>
    <div class="stats"><div class="stat"><span class="eyebrow">Attempts</span><b>${st.attempts}</b></div><div class="stat"><span class="eyebrow">Pass rate</span><b>${rate == null ? "–" : rate + "%"}</b><span class="small muted">${st.passes} passed · ${st.fails} not</span></div><div class="stat"><span class="eyebrow">Boules thrown</span><b>${st.boules}</b></div><div class="stat"><span class="eyebrow">Day streak</span><b>${streakLive ? st.streak : 0}</b></div></div>
    <div><div class="eyebrow" style="margin-bottom:8px">Levels</div><div class="badges">${LEVELS.map(l => `<div class="badge ${levelPassed(l.id) ? "on" : levelSkipped(l.id) ? "skip" : ""}"><span class="bd">${levelPassed(l.id) ? "✓" : l.order}</span><span>${esc(l.name)}</span><span class="small muted">${levelPassed(l.id) ? fmtDate(levelProg(l.id).passedAt) : levelSkipped(l.id) ? "Skipped" : `${lessonsDone(l)}/${l.lessons.length}`}</span></div>`).join("")}</div></div>
    <section><div class="eyebrow" style="margin-bottom:8px">Drills</div>${drillsUsed.length ? `<div class="tw"><table><thead><tr><th>Drill</th><th class="n">Attempts</th><th class="n">Best</th><th class="n">Last</th><th>Form</th></tr></thead><tbody>${drillsUsed.map(d => { const s = drillStat(d.id); return `<tr><td style="white-space:normal"><a href="#/drill/${d.id}">${esc(d.title)}</a><div class="small muted">${esc(LEVEL[d.levelId].name)}${d.distance ? ` · ${d.distance} m` : ""}</div></td><td class="n">${s.n}<div class="small muted">${s.passes} ✓</div></td><td class="n">${s.best.made}/${s.best.of}</td><td class="n">${s.last.made}/${s.last.of}</td><td>${dots(s.hist || [])}</td></tr>`; }).join("")}</tbody></table></div>` : `<div class="muted">No attempts yet. Open a drill from any lesson, or from the Drills tab.</div>`}</section>
    <section><div class="eyebrow" style="margin-bottom:8px">Recent attempts</div>${recent.length ? `<div class="tw"><table><thead><tr><th>When</th><th>What</th><th class="n">Result</th><th></th></tr></thead><tbody>${recent.map(a => `<tr><td>${fmtDateTime(a.at)}</td><td style="white-space:normal">${a.kind === "practice" ? `${esc(LEVEL[a.levelId]?.name || "")} practice session` : a.kind === "quiz" ? `Quiz · ${esc(LEVEL[a.levelId]?.name || "")}` : esc(DRILL[a.drillId]?.title || a.drillId)}${a.practice && a.kind !== "practice" ? ` <span class="small muted">(in session)</span>` : ""}</td><td class="n">${a.made}/${a.of}</td><td>${a.passed ? `<span class="pill done">Passed</span>` : `<span class="pill fail">Missed</span>`}</td></tr>`).join("")}</tbody></table></div>` : `<div class="muted">No attempts yet</div>`}</section>
    <div class="row"><button type="button" class="btn" data-act="export">Export progress</button><button type="button" class="btn danger" data-act="reset">Reset progress</button></div>
  </div>`;
}

/* ---------- more ---------- */
function renderMore() {
  const auth = S.auth;
  return `<div class="stack"><h1>More</h1>
    ${auth ? `<section class="panel stack" style="gap:8px"><div class="eyebrow">Account</div>${auth.user && !auth.user.isAnonymous ? `<div>Signed in as <b data-notr>${esc(auth.user.displayName || auth.user.email || "")}</b>. Your progress follows you to any device you sign in on.</div><div class="row"><button type="button" class="btn" data-act="signout">Sign out</button></div>` : `<div>Your progress is saved on this device. Sign in with Google to keep it across devices.</div><div class="row"><button type="button" class="btn primary" data-act="signin">Sign in with Google</button></div>`}${auth.error ? `<div class="notice" data-notr>${esc(auth.error)}</div>` : ""}</section>` : `<section class="panel stack" style="gap:8px"><div class="eyebrow">Your progress</div><div>Saved on this device.</div></section>`}
    <section class="panel stack" style="gap:8px"><div class="eyebrow">Language</div><div class="row">${LANGS.map(([c, n]) => `<button type="button" class="btn ${I18N.lang === c ? "primary" : ""}" data-lang="${c}" data-notr>${n}</button>`).join("")}</div><div class="small muted">Lessons are in English for now; the app's buttons and labels follow the language you choose.</div></section>
    ${S.install ? `<section class="panel stack" style="gap:8px"><div class="eyebrow">Install the app</div><div>Add SN Pétanque Academy to your home screen to open it like an app, with no signal needed.</div><div class="row"><button type="button" class="btn primary" data-act="install">Install the app</button></div></section>` : ""}
    <section class="panel stack" style="gap:8px"><div class="eyebrow">About</div><div><b>SN Pétanque · Academy</b> teaches pétanque in five levels, each with lessons, drills and a practice session that unlocks the next. In loving memory of Steve Noel.</div><div>Running a competition? The <a href="https://snpetanque.com" target="_blank" rel="noopener">Competition desk</a> handles draws, pistes and live scores.</div><div class="small muted">Videos are embedded from YouTube and belong to their creators. Curriculum v${C.version}.</div></section>
  </div>`;
}

/* ---------------- events ---------------- */
document.addEventListener("click", async e => {
  const go_ = e.target.closest("[data-go]"); if (go_) { go(go_.dataset.go); return; }
  const tab = e.target.closest("[data-tab]"); if (tab) { go({ home: "#/", drills: "#/drills", progress: "#/progress", more: "#/more" }[tab.dataset.tab]); return; }
  const lg = e.target.closest("[data-lang]"); if (lg) { S.langMenu = false; I18N.lang = lg.dataset.lang; lsSet("academy-lang", I18N.lang); document.documentElement.lang = I18N.lang; render(); return; }
  if (S.langMenu && !e.target.closest(".lang-wrap")) { S.langMenu = false; renderHeader(); }
  const el = e.target.closest("[data-act]"); if (!el) return;
  const act = el.dataset.act; const R = S.run;
  switch (act) {
    case "lang-menu": S.langMenu = !S.langMenu; renderHeader(); break;
    case "modal-bg": if (e.target === el) closeModal(); break;
    case "play": S.video = el.dataset.lesson; render(); break;
    case "lesson-done": await setLessonDone(el.dataset.lesson, !lessonDone(el.dataset.lesson)); break;
    case "start-here": await setSkipped(el.dataset.level); toast("Earlier levels marked as skipped. The practice session is open."); break;
    case "set": { const r = R && (R.kind === "practice" ? R.cur : R); if (!r || r.done || r.mode === "precision" || r.quiz) break; r.sets.push(+el.dataset.n);
      if (runComplete(r)) { const res = finishRun(r); if (R.kind === "practice") await practiceBlockDone(res); else await recordAttempt({ kind: "drill", drillId: r.drillId, levelId: DRILL[r.drillId].levelId, mode: r.mode, made: res.made, of: res.of, boules: res.boules, pass: r.pass, passed: res.passed, sets: r.sets.slice() }); }
      render(); break; }
    case "shot": { const r = R && (R.kind === "practice" ? R.cur : R); if (!r || r.done || r.mode !== "precision") break; r.shots[+el.dataset.i] = +el.dataset.s; render(); break; }
    case "run-finish": { const r = R && (R.kind === "practice" ? R.cur : R); if (!r || r.done || r.quiz || !runComplete(r)) break; const res = finishRun(r);
      if (R.kind === "practice") await practiceBlockDone(res); else await recordAttempt({ kind: "drill", drillId: r.drillId, levelId: DRILL[r.drillId].levelId, mode: r.mode, made: res.made, of: res.of, boules: res.boules, pass: r.pass, passed: res.passed, shots: r.shots.slice() });
      render(); break; }
    case "run-undo": { const r = R && (R.kind === "practice" ? R.cur : R); if (!r || r.done || r.quiz) break; if (r.mode === "precision") { let i = r.shots.length - 1; while (i >= 0 && r.shots[i] == null) i--; if (i >= 0) r.shots[i] = null; } else r.sets.pop(); render(); break; }
    case "run-again": if (R && R.kind === "drill") S.run = Object.assign(newRun(blockSpec({ drill: R.drillId })), { kind: "drill" }); render(); break;
    case "quiz-pick": { if (!S.quiz || S.quiz.key !== el.dataset.key || S.quiz.picked != null) break; S.quiz.picked = +el.dataset.i; render(); break; }
    case "quiz-next": { const Q = S.quiz; if (!Q || Q.key !== el.dataset.key || Q.picked == null) break; Q.answers.push(Q.picked); Q.picked = null; Q.n++;
      if (Q.n >= Q.qs.length) { Q.done = true; const made = Q.answers.filter((a, i) => a === Q.qs[i].q.correct).length;
        if (Q.key.startsWith("lesson:")) await recordAttempt({ kind: "quiz", quizId: Q.key, levelId: LESSON[Q.key.slice(7)].levelId, made, of: Q.qs.length, pass: Q.qs.length, passed: made === Q.qs.length, questions: Q.qs.map((x, i) => ({ lessonId: x.lessonId, i: x.i, picked: Q.answers[i], correct: x.q.correct })) });
        else if (R && R.kind === "practice" && R.cur?.key === Q.key) await practiceBlockDone({ made, of: Q.qs.length, passed: made >= R.blocks[R.i].pass, boules: 0, questions: Q.qs.map((x, i) => ({ lessonId: x.lessonId, i: x.i, picked: Q.answers[i], correct: x.q.correct })) }); }
      render(); break; }
    case "quiz-again": { const key = el.dataset.key; if (key.startsWith("lesson:")) { const x = LESSON[key.slice(7)]; startQuiz(key, x.quiz.map((q, qi) => ({ lessonId: x.id, i: qi, q })), x.quiz.length); } render(); break; }
    case "practice-next": await practiceAdvance(); break;
    case "practice-retake": { const id = R.levelId; S.run = null; S.quiz = null; go(`#/practice/${id}`); break; }
    case "export": { const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), progress: S.progress, attempts: S.attempts }, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `sn-petanque-academy-${dayKey(now())}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); break; }
    case "reset": modal(`<h3>Reset progress?</h3><p style="margin:0">This clears every lesson, drill result and level pass on this account. It can't be undone.</p><div class="row" style="justify-content:flex-end"><button type="button" class="btn" data-act="modal-close">Cancel</button><button type="button" class="btn danger" data-act="reset-yes">Yes, reset</button></div>`); break;
    case "reset-yes": await resetProgress(); break;
    case "modal-close": closeModal(); break;
    case "account": go("#/more"); break;
    case "signin": S.auth?.signIn?.(); break;
    case "signout": S.auth?.signOut?.(); break;
    case "install": S.install?.(); break;
  }
});
document.addEventListener("keydown", e => { if (e.key === "Escape") { if ($("#modal").firstChild) closeModal(); else if (S.langMenu) { S.langMenu = false; renderHeader(); } } });

/* ---------------- start ---------------- */
async function start() {
  S.route = parseHash();
  const d = await S.store.load(); S.progress = Object.assign(EMPTY(), d.progress || {}); S.progress.stats = Object.assign(EMPTY().stats, S.progress.stats || {}); S.attempts = d.attempts || [];
  S.ready = true; render();
}
window.__academy = { S, render, go, LEVELS, LEVEL, DRILL, LESSON, recordAttempt, saveProgress, EMPTY, tr, I18N, quizBank, levelQuizBank, toast, esc, fmtDate, fmtDateTime, pct, bar, dots, crumbs, localize };

/* @@BOOT-START */
S.store = localStore();
start();
/* @@BOOT-END */
})();
