// The curriculum is data, so this checks it is well formed: unique ids, every reference resolves, quiz answers in range, pass marks reachable.
const open = require('./browser');
(async () => {
  const { p, errs, close } = await open();
  const r = await p.evaluate(() => {
    const C = window.CURRICULUM; const out = []; const ids = new Set(); const dup = [];
    const add = id => { if (ids.has(id)) dup.push(id); ids.add(id); };
    const strands = new Set(C.strands.map(s => s.id)); const drills = {};
    C.levels.forEach(l => { add(l.id); l.drills.forEach(d => { add(d.id); drills[d.id] = d; }); });
    const bad = [];
    C.levels.forEach(l => {
      l.lessons.forEach(x => { add(x.id); if (!strands.has(x.strand)) bad.push(`${x.id}: strand ${x.strand}`); if (!l.strands.includes(x.strand)) bad.push(`${x.id}: strand not listed on level`);
        if (x.drill && !drills[x.drill]) bad.push(`${x.id}: drill ${x.drill}`);
        if (x.video && !/^[\w-]{11}$/.test(x.video.id)) bad.push(`${x.id}: video id ${x.video.id}`);
        if (!Array.isArray(x.body) || !x.body.length) bad.push(`${x.id}: body`);
        (x.quiz || []).forEach((q, i) => { if (!(q.correct >= 0 && q.correct < q.a.length)) bad.push(`${x.id} q${i}: correct out of range`); if (!q.why) bad.push(`${x.id} q${i}: no explanation`); if (q.scene && !q.scene.jack) bad.push(`${x.id} q${i}: scene without jack`); }); });
      l.drills.forEach(d => { const max = d.mode === "precision" ? d.shots.length * 5 : (d.sets || 1) * d.boules; if (!(d.pass > 0 && d.pass <= max)) bad.push(`${d.id}: pass ${d.pass} of ${max}`); if (!d.metric) bad.push(`${d.id}: metric`); if (!d.setup?.length) bad.push(`${d.id}: setup`);
        if (d.mode === "precision") d.shots.forEach(([k, m]) => { if (!C.ateliers.some(a => a[0] === k)) bad.push(`${d.id}: atelier ${k}`); if (!(m >= 6 && m <= 10)) bad.push(`${d.id}: distance ${m}`); }); });
      const bank = l.lessons.reduce((n, x) => n + (x.quiz || []).length, 0);
      l.practice.blocks.forEach((b, i) => { if (b.quiz) { if (!(b.pass <= b.count)) bad.push(`${l.id} block ${i}: quiz pass > count`); if (bank < b.count) out.push(`${l.id}: quiz block needs ${b.count}, level has ${bank} (lower levels fill in)`); }
        else { const d = drills[b.drill]; if (!d) { bad.push(`${l.id} block ${i}: drill ${b.drill}`); return; } const max = d.mode === "precision" ? d.shots.length * 5 : (b.sets || d.sets || 1) * (b.boules || d.boules); if (!(b.pass > 0 && b.pass <= max)) bad.push(`${l.id} block ${i}: pass ${b.pass} of ${max}`); }
        if (!b.label) bad.push(`${l.id} block ${i}: label`); });
    });
    const orders = C.levels.map(l => l.order).join(",");
    return { levels: C.levels.length, lessons: Object.keys(ids).length, dup, bad, orders, notes: out, full: C.levels.filter(l => !l.outline).map(l => l.id).join(","), counts: C.levels.map(l => `${l.id}:${l.lessons.length}/${l.drills.length}/${l.practice.blocks.length}`).join(" ") };
  });
  console.log(`levels ${r.levels} orders ${r.orders}`); console.log(`full ${r.full}`); console.log(`counts ${r.counts}`);
  console.log(`duplicates ${JSON.stringify(r.dup)}`); console.log(`problems ${JSON.stringify(r.bad)}`); console.log(`notes ${JSON.stringify(r.notes)}`);
  console.log('errs', errs); await close();
})();
