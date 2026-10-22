// SN Pétanque Academy: the curriculum is data. Edit these files to change lessons, drills and pass marks; no app code needs to change.
// Each level file pushes one level onto CURRICULUM.levels. Lesson bodies are plain paragraphs, with {h:"Heading"}, {list:[...]}, {tip:"..."} blocks.
// Videos are YouTube ids; swap any of them here. A lesson with video:null shows no video.
window.CURRICULUM = {
  version: 1,
  strands: [
    { id: "pointing", name: "Pointing", fr: "Le point", blurb: "Getting your boule to stop close to the jack." },
    { id: "shooting", name: "Shooting", fr: "Le tir", blurb: "Hitting a boule out of the way, in the air." },
    { id: "tactics", name: "Tactics & game sense", fr: "La tactique", blurb: "Choosing the right shot at the right moment." },
    { id: "rules", name: "Rules & etiquette", fr: "Règles et usages", blurb: "Playing the game properly, and being good to play against." },
    { id: "mind", name: "Mind & body", fr: "Mental et physique", blurb: "Routines, pressure, and keeping your body ready." },
  ],
  // Precision shooting (tir de précision), as used in the SN Pétanque competition desk
  ateliers: [["A1", "Lone boule"], ["A2", "Boule behind the jack"], ["A3", "Boule between two boules"], ["A4", "Boule behind an obstacle"], ["A5", "The jack"]],
  levels: [],
};
