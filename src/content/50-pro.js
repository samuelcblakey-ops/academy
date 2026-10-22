// Level 5 · Pro (Élite). OUTLINE: lesson summaries, drills and a draft practice session.
window.CURRICULUM.levels.push({
  id: "pro", name: "Pro", fr: "Élite", order: 5, outline: true,
  tagline: "Preparing to win",
  summary: "Season planning, stats-driven training, video self-analysis, tournament formats and captaincy, and the timed full session that mirrors a competition day.",
  strands: ["pointing", "shooting", "tactics", "rules", "mind"],
  lessons: [
    { id: "p-point-1", strand: "pointing", title: "Pointing at 10 m", minutes: 7, video: null, body: ["Outline. The long lob and the long half-lob, and the fitness they need."], keyPoints: ["Ten metres is a different throw."], drill: "p-d-10m", quiz: null },
    { id: "p-point-2", strand: "pointing", title: "Pointing under the clock", minutes: 6, video: null, body: ["Outline. Reading, deciding and throwing inside twenty seconds without losing the routine."], keyPoints: ["Quick, not rushed."], drill: "p-d-5dist", quiz: null },
    { id: "p-shoot-1", strand: "shooting", title: "Shooting targets by distance", minutes: 7, video: null, body: ["Outline. Setting percentage targets at 6, 7, 8, 9 and 10 m from your history and training to the weakest distance."], keyPoints: ["Train the weakest distance."], drill: "p-d-precision", quiz: null },
    { id: "p-shoot-2", strand: "shooting", title: "Video self-analysis", minutes: 8, video: null, body: ["Outline. Filming from behind and from the side, what to look for (head on the line, release height, follow-through), and comparing clips a month apart."], keyPoints: ["Film from behind; watch the head."], quiz: null },
    { id: "p-tact-1", strand: "tactics", title: "Formats: Swiss, poules, knockout, time limits", minutes: 8, video: null, body: ["Outline. How each format rewards consistency or aggression, tiebreaks (points difference, Buchholz), and how to play a round you only need to draw."], keyPoints: ["Know the tiebreak before the last round."], quiz: null },
    { id: "p-tact-2", strand: "tactics", title: "Captaincy and pairings", minutes: 7, video: null, body: ["Outline. Choosing who points and who shoots on the day, speaking in the circle, and changing a plan that isn't working."], keyPoints: ["One voice in the circle."], quiz: null },
    { id: "p-tact-3", strand: "tactics", title: "Scouting with competition stats", minutes: 6, video: null, body: ["Outline. Using SN Pétanque competition data and stream overlays to see your own and your opponents' shooting and pointing numbers."], keyPoints: ["Numbers before narratives."], quiz: null },
    { id: "p-rules-1", strand: "rules", title: "National and international differences", minutes: 6, video: null, body: ["Outline. Where FIPJP, national federation and club rules differ, and how to check before a competition."], keyPoints: ["Read the competition's rules sheet."], quiz: null },
    { id: "p-mind-1", strand: "mind", title: "A season plan", minutes: 8, video: null, body: ["Outline. Blocks of technique, volume and competition; rest weeks; and how to use the Academy history to set the next block."], keyPoints: ["Plan in blocks; review with the numbers."], quiz: null },
    { id: "p-mind-2", strand: "mind", title: "Between games", minutes: 5, video: null, body: ["Outline. Resetting after a loss, staying warm between a morning Swiss and an afternoon knockout, and the final."], keyPoints: ["The afternoon is a new competition."], quiz: null },
  ],
  drills: [
    { id: "p-d-10m", strand: "pointing", title: "Ten at 10 m inside 1 m", distance: 10, setup: ["Jack at 10 m."], boules: 5, sets: 2, metric: "boules within 1 m of the jack", pass: 5, benchmark: { typical: 4, good: 7 }, tips: [] },
    { id: "p-d-5dist", strand: "pointing", title: "Five distances inside 50 cm", distance: 10, setup: ["Jacks (or marks) at 6, 7, 8, 9 and 10 m; two boules at each, in order, timed: 20 seconds per boule."], boules: 5, sets: 2, metric: "boules inside 50 cm", pass: 5, benchmark: { typical: 4, good: 7 }, tips: ["One set is one boule at each distance."] },
    { id: "p-d-precision", strand: "shooting", title: "Tir de précision, competition pace", distance: 9, mode: "precision",
      shots: [["A1", 6], ["A1", 7], ["A1", 8], ["A1", 9], ["A2", 6], ["A2", 7], ["A2", 8], ["A2", 9], ["A3", 6], ["A3", 7], ["A3", 8], ["A3", 9], ["A4", 6], ["A4", 7], ["A4", 8], ["A4", 9], ["A5", 6], ["A5", 7], ["A5", 8], ["A5", 9]],
      setup: ["The full format, with no more than one minute between shots."], metric: "points over twenty shots (max 100)", pass: 35, benchmark: { typical: 30, good: 50 }, tips: [] },
  ],
  practice: {
    id: "p-pro", title: "Pro practice session", draft: true,
    intro: "Draft standard: a timed session that mirrors a competition day. Pass every block in one session to complete the Academy.",
    blocks: [
      { drill: "p-d-precision", pass: 35, label: "Tir de précision at competition pace: 35 points" },
      { drill: "p-d-5dist", sets: 2, boules: 5, pass: 5, label: "Five distances inside 50 cm: five of ten" },
      { drill: "p-d-10m", sets: 2, boules: 5, pass: 5, label: "Ten boules at 10 m: five within 1 m" },
      { quiz: true, count: 10, pass: 9, label: "Ten rules and tactics questions: get nine right" },
    ],
  },
});
