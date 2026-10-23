# SN Pétanque Academy

Learn pétanque in five levels (Entry, Beginners, Intermediate, Expert, Pro). Each level has lessons with YouTube videos, drills you score on your phone, and a practice session that unlocks the next level. Every drill, quiz and session is recorded, so a player (and the admin) can see attempts, passes, fails, bests and streaks. Companion to the [Competition desk](https://snpetanque.com). In loving memory of Steve Noel.

Live at <https://samuelcblakey-ops.github.io/academy/>.

## Layout

| Path | What it is |
|---|---|
| `src/academy.html` | The app shell: styles and markup. Loads the files below. |
| `src/content/*.js` | **The curriculum, as data.** One file per level: lessons (text, video id, key points, quiz), drills (sets, boules, metric, pass mark, benchmarks) and the practice session (blocks and pass marks). Edit these to change what the Academy teaches; no app code needs to change. |
| `src/app.js` | The app: level map, lessons, drill and precision-shooting runners, quizzes, practice sessions, progress, two languages. Saves to this device until the web layer replaces the store. |
| `src/web-boot.js` | Website-only layer: Firebase progress store (anonymous sign-in, Google link, offline cache, multi-device merge), the admin page (`#/admin`), service worker and install prompt. |
| `public/` | Static files copied into the site as-is (`firebase-config.js` is safe to publish). |
| `scripts/build.py` | Builds `dist/` (the website) from `src/` + `public/`. `scripts/icons.py` draws the icons. |
| `tests/` | Browser tests. `app-*` need nothing; `web-*` run against the Firebase emulators. `tests/firestore.rules` is a **test copy** of the rules (see below). |

## Where the data lives

Same Firebase project as the desk (`carreau-petanque`). Every device signs in anonymously, so progress is saved to the cloud from the first drill:

- `academy/{uid}`: the player's progress document (`progress`, `profile`, `updatedAt`).
- `academy/{uid}/attempts/{id}`: one record per drill, quiz or practice session (sets or shots, made/of, pass mark, passed, when, and which session it was part of).

Signing in with Google links the anonymous account to the Google one, so the same progress opens on every device; if the Google account already has progress, the device's progress is merged in. The admin (Google sign-in as the admin email) sees every player at `#/admin`.

**Security rules.** Firestore has one rules file per project, and it is deployed by the **competition desk repo** (`samuelcblakey-ops/carreau`, `firestore.rules`). That file must contain the `/academy` section (it is in `tests/firestore.rules` here, after the desk's own rules). Keep the two in step: change the desk's copy through a pull request there, and copy the same change into `tests/firestore.rules` here so the emulator tests match.

## How changes ship

1. **One small, self-contained change per branch**, then a pull request (GitHub Desktop: *Branch → New branch*, then *Create Pull Request*).
2. **CI runs automatically** on the pull request: build, app tests, web tests against the emulators. A red ✗ means don't merge.
3. **Merge to `main` = release.** GitHub Actions deploys `dist/` to GitHub Pages. Allow about ten minutes.
4. To roll back, revert the commit (GitHub Desktop: *History → right-click → Revert*).

## Run it locally

```bash
npm ci
npx playwright install chromium
npm test            # build + app tests + web tests (needs Java for the emulators)
npm run test:app    # quick: app tests only, no Java needed
npm run build       # just build dist/
```

## One-time settings

1. **Publish the repo** (done): GitHub Desktop → *File → Add local repository* → this `academy` folder → *Publish repository* (public).
2. **GitHub Pages** (done): repo *Settings → Pages → Source: GitHub Actions*. No custom domain: the site is served at `samuelcblakey-ops.github.io/academy/`, which is already an authorised sign-in domain in Firebase.
3. **Protect `main`**: *Settings → Branches → Add classic branch protection rule* for `main`: require a pull request (no approvals needed) and require the `test` check to pass. GitHub asks you to confirm access by email first.
4. **Rules**: the `/academy` section of `firestore.rules` is deployed from the desk repo (PR #22 there). Until it is live, the Academy site can't save progress.

## Content notes

- Levels Entry and Beginners are written in full. Intermediate, Expert and Pro are outlines: lesson summaries, real drills with pass marks, and practice sessions marked *draft standard*; their full lesson text and videos are still to come.
- Videos are embedded from YouTube (privacy-enhanced `youtube-nocookie.com`) and belong to their creators; swap any video by changing its id in `src/content/`.
- Pass marks: Entry and Beginners are pitched in line with national beginners' awards (e.g. six out of ten within a metre at 6 m, three clean hits in ten at 6 m). Precision-shooting drills use the FIPJP 0/1/3/5 scoring and the five workshops already used by the desk's live shooting scorer.
- Lesson text is in English; the app's buttons and labels also come in French (`FR_TEXT` in `src/app.js`, same dictionary approach as the desk).
