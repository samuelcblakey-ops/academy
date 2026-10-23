// Test runner. `node tests/run.js app` runs the in-browser app tests (no Firebase needed);
// `node tests/run.js web` runs the website tests against the Firebase emulators
// (start them with `npm test`, which wraps this in `firebase emulators:exec`).
// Each test prints what it saw; the expectations below decide pass or fail.
const { execFile } = require('child_process'), path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, '..', 'test-results'); fs.mkdirSync(OUT, { recursive: true });
const SUITES = {
  app: {
    'app-content.js': [/levels 5 orders 1,2,3,4,5/, /full entry,beginners/, /duplicates \[\]/, /problems \[\]/, /errs \[\]/],
    'app-home.js': [/levels: 5 first: Entry pill: CURRENT/, /continue: CONTINUE \| Entry · Rules & etiquette \| What pétanque is · 5 min \| Start/,
      /level page: Level 1 · Entry \| strands 4 \| lessons 10 \| drills 4/, /practice panel: Entry practice session \| start button: true/,
      /lesson: What pétanque is \| video thumb: true \| key points: 3 \| quiz: true/, /iframe after play: https:\/\/www\.youtube-nocookie\.com\/embed\/wLfhUzXNvHk/,
      /done button: ✓ Done \| saved: 1/, /next lesson: How an end works/, /continue: How an end works · 6 min/, /bar width: 10%/,
      /beginners locked: true \| notice: Pass the Entry session first/, /after start here: open true \| entry skipped: true/, /current level now: Beginners/, /errs \[\]/],
    'app-drill.js': [/drill: Ten to the jack at 6 m \| setup open: true \| pad buttons: 6 \| prompt: How many boules that stop within 1 m of the jack\?/,
      /undo: sets 0/, /result: 5\/10 \| Passed! \| panel pass/, /recorded: attempts 1 kind drill made 5\/10 passed true sets \[3,2\] \| stats \{"attempts":1,"passes":1,"fails":0,"boules":10,"streak":1,\} \| drill \{"made":5,"of":10,"passed":true\}/,
      /second go: 2\/10 fail \| best line: Best 5\/10 · 2 attempts/, /precision: Precision shooting workshops at 6 m \| shots 10 \| first: A1 · Lone boule · 6 m \| finish disabled: true/,
      /scored: total 19 points \| finish enabled: true/, /undo last shot: null total 18 points/, /precision result: 23\/50 \| pass/,
      /precision recorded: made 23\/50 boules 10 shots \[0,1,3,5,0,1,3,5,0,5\] \| totals attempts 3 boules 30 passes 2 fails 1/,
      /progress: ATTEMPTS 3 \| PASS RATE 67% 2 passed · 1 not \| BOULES THROWN 30 \| DAY STREAK 1/, /recent first: .* Precision shooting workshops at 6 m 23\/50 PASSED/, /drills tab: 25 drills, ticks 2/, /errs \[\]/],
    'app-practice.js': [/block 1: BLOCK 1 OF 3 \| Point ten boules at 6 m: five within 1 m of the jack \| pad 6/, /block 1 result: 4\/10 \| next button: Next block \| no go-again: true/,
      /block 3: BLOCK 3 OF 3 \| quiz q: QUESTION 1 OF 4 · .+ \| options 4/, /q4: Correct\. \| next: Finish/, /quiz done: 4\/4 \| next: Finish/,
      /session: Not this time \| rows 3 \| pills Missed,Passed,Passed/, /recorded: kinds drill,drill,quiz,practice \| practice passed false blocks 3 \| level entry: \{"attempts":1,"fails":1\} \| in-session drill counted: 1/,
      /retake: BLOCK 1 OF 3/, /passed: Level passed: Entry \| next link: Go to Beginners \| toast: Level passed: Entry!/, /level entry passed: true attempts 2 fails 1/,
      /home: entry pill PASSED \| current Beginners \| entry line: 0 of 10 lessons · practice passed/, /beginners practice open: Start practice session/, /badges: on,-,-,-,-/, /errs \[\]/],
    'app-quiz.js': [/lesson: Shoot or point\? The beginner's rule \| scene drawn: true \| boules: [12]/, /wrong: Not quite\. \| classes: wrong true right true \| disabled true/, /right: Correct\./,
      /done: 1\/2 \| 1 to look at again\. \| again button: Go again/, /recorded: quiz lesson:b-tact-2 1\/2 passed false \| quizzes \{"n":1,"passes":0,"fails":1/, /again: QUESTION 1 OF 2 \| options 4/, /errs \[\]/],
    'app-mobile.js': [/phone: \{"overflow":false,"navFixed":true,"navBottom":true,"icons":true,"header":\d{2,3},"touch":\{"pad":true,"btn":true\}\}/, /desktop: \{"overflow":false,"navFixed":false,"navBottom":false,"icons":false/, /errs \[\]/],
    'app-languages.js': [/menu closed: true/, /menu open: true options 2/, /fr: FR ▾ \| À LA MÉMOIRE DE STEVE NOEL \| tabs Apprendre,Exercices,Progrès,Plus \| continue CONTINUER \| level Découverte/,
      /fr drill: Série 1 \| CONSEILS \| pass Total en cours 0\/10 · seuil de réussite 5/, /remembered: FR ▾/, /back to english: IN LOVING MEMORY OF STEVE NOEL \| Learn,Drills,Progress,More/, /errs \[\]/],
  },
  web: {
    'web-progress.js': [/anonymous: true uid \w+ \| light: live LIVE/, /saved to cloud: doc true uid matches true attempts 1 \| profile anonymous true/,
      /other device sees nothing of A: progress null attempts 0 \| write to A denied: permission-denied/,
      /same uid again: lessons 1 attempts 1 drill best 5\/10/, /offline save: result shown 7\/10 \| light off OFFLINE · \d+ WAITING/, /back online: light live \| cloud attempts 2/, /errs \[\]/],
    'web-signin.js': [/linked: linked \| still has progress: lessons 1 attempts 1 \| profile: (Sam Test|null) sam@example.com anonymous false/,
      /device B merged: merged \| lessons 2 attempts 2 drills e-d-10at6 best 6\/10 n 2 \| cloud doc lessons 2/, /signed out: anonymous true lessons 0/,
      /B signs back in: (signed-in|merged) lessons 2 attempts 2/, /errs \[\]/],
    'web-admin.js': [/visitor admin page: sign-in prompt true/, /visitor cannot list players: permission-denied/,
      /admin: players [3-9]\d* \| header PLAYER/, /admin sees sam@example.com: true \| a visitor row: true/, /errs \[\]/],
    'web-pwa.js': [/manifest: \[true,"standalone",3,true,200,"image\/png",true\]/, /service worker: true/, /cname: none/, /errs \[\]/],
  },
};
(async () => {
  const suite = process.argv[2] || 'app'; const env = { ...process.env, OUT };
  let srv;
  if (suite === 'app') env.APP_URL = 'file://' + path.join(__dirname, '..', 'src', 'academy.html');
  else { srv = await require('./serve')(5056); env.WEB_URL = 'http://127.0.0.1:5056/'; }
  let failed = 0;
  for (const [file, expects] of Object.entries(SUITES[suite])) {
    let out = '';
    out = await new Promise(res => execFile('node', [path.join(__dirname, file)], { env, encoding: 'utf8', timeout: 240000, maxBuffer: 1 << 24 },
      (err, stdout, stderr) => res(stdout + (err ? '\n' + (stderr || err.message) : ''))));
    fs.writeFileSync(path.join(OUT, file.replace('.js', '.log')), out);
    const miss = expects.filter(re => !re.test(out));
    if (miss.length) { failed++; console.log(`✗ ${file}\n  missing: ${miss.join('\n           ')}\n--- output ---\n${out}\n`); }
    else console.log(`✓ ${file}`);
  }
  srv?.close();
  console.log(failed ? `${failed} test file(s) failed` : 'all tests passed'); process.exit(failed ? 1 : 0);
})();
