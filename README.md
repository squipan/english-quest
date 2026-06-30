# English Quest 🗡️

An offline-friendly PWA to help beginner junior high students in Japan
practice English vocabulary and sentence patterns (Eiken 5級 → 4級 level),
RPG-style — solo monster battles, a sentence builder, and a team "boss
battle" mode for group play.

## What's included

- `index.html` / `style.css` / `app.js` — the app itself (plain JS, no build step)
- `content.js` — **edit this** to add/change vocabulary units and sentences
- `sync.js` — optional shared-leaderboard sync (off by default, see below)
- `manifest.json` + `service-worker.js` — makes it installable & offline-capable
- `icons/` — app icons

## 1. Try it locally

Just open `index.html` in a browser, or for the service worker to work properly, serve it locally:

```bash
cd english-quest
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## 2. Deploy with GitHub Pages (recommended)

1. Create a new GitHub repo (e.g. `english-quest`).
2. Upload all these files to the repo (drag-and-drop on github.com works, or `git push`).
3. Go to **Settings → Pages**, set source to the `main` branch, root folder.
4. Your app will be live at `https://<your-username>.github.io/english-quest/`.
5. Share that link with students (or generate a QR code for it). On their phone they should open it in Chrome/Safari and use **"Add to Home Screen"** to install it like an app.
6. **To update later:** just edit a file (e.g. `content.js` to add new words) and push/upload again. Students will get the new version automatically next time they open the app (the service worker checks for updates).

> Tip: each time you make a meaningful update, bump `CACHE_NAME` in `service-worker.js` (e.g. `english-quest-v2`) so phones refresh their cached copy faster.

## 3. How offline + scoring works right now

- Every student's points and progress are saved **on their own phone** (localStorage), so it works with zero signal, always.
- The Leaderboard tab shows their own score by default.
- **Team Boss Battle** is designed to be played on one shared device (pass the phone around the group, or project it) — so the whole team's score updates live without needing internet at all. Great for in-class moments.

## 4. (Optional) Turn on a real shared leaderboard across phones

Right now, the "Ranking" tab only shows each student's own score unless they're
in the same Team Boss Battle session. If you want individual scores to sync
and show up on **everyone's phone** once they have Wi-Fi, you can connect a
free Firebase project — takes about 10 minutes, no coding needed beyond
pasting a config:

1. Go to https://console.firebase.google.com → **Create a project** (free).
2. In the project, go to **Build → Realtime Database → Create Database** (start in test mode for a classroom setting).
3. Go to **Project settings → General → Your apps → Add app → Web**, and copy the `firebaseConfig` object it gives you.
4. Open `sync.js` in this project and paste your config into the `firebaseConfig` variable near the top (it's currently `null`).
5. Add this line to `index.html`, right before `<script src="sync.js"></script>`:
   ```html
   <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
   ```
6. Push the changes to GitHub. Now, whenever a student's phone has internet, their score automatically syncs, and everyone's Ranking tab pulls the latest shared list.

If you skip this section entirely, the app still works great — students just see their own score until you're ready to add this.

## 5. Editing vocabulary / sentences

Open `content.js`. Each unit looks like this:

```js
{
  id: "school",
  name: "School Life",
  emoji: "🏫",
  level: 5,           // Eiken level, just for labeling
  words: [
    { en: "student", ja: "生徒" },
    ...
  ]
}
```

Add a new unit object to the `UNITS` array, or add words to an existing one.
Sentences for the Sentence Builder game live in the `SENTENCES` array the
same file — `tokens` is the sentence in correct word order (the game
shuffles it for the student to rebuild).

## 6. Game modes summary

| Mode | How it works | Points |
|---|---|---|
| Solo Quiz Battle | Pick a unit, answer multiple-choice vocab questions to defeat a monster | 10/correct + 20 bonus for a perfect run |
| Sentence Builder | Tap word tiles in the correct order to build a sentence | 15/correct |
| Team Boss Battle | Teams take turns (shared device) answering mixed questions to defeat a boss together | 10/correct team hit, +5 personal participation bonus |

Have fun, and feel free to tweak colors/copy in `style.css` / `index.html` to match your class's vibe!
