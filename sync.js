/* ============================================================
   English Quest — Sync layer (OPTIONAL)
   ------------------------------------------------------------
   The app works fully offline without this. To enable a SHARED
   leaderboard that syncs across student phones once they have
   internet, fill in firebaseConfig below with your own free
   Firebase project's keys (see README.md "Set up shared
   leaderboard" section for step-by-step instructions).

   Until you fill this in, EQSync.isConfigured() returns false
   and the app simply keeps each student's score on their own
   device (still fully playable).
   ============================================================ */
(function (global) {
  "use strict";

  // ---- 1) PASTE YOUR FIREBASE CONFIG HERE (or leave as null) ----
  var firebaseConfig = null;
  /* Example, after you create a free Firebase project:
  var firebaseConfig = {
    apiKey: "AIza...",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project",
  };
  */

  var ready = false;
  var db = null;

  function init() {
    if (!firebaseConfig || typeof firebase === "undefined") return;
    try {
      firebase.initializeApp(firebaseConfig);
      db = firebase.database();
      ready = true;
    } catch (e) {
      console.warn("EQSync: Firebase init failed", e);
    }
  }

  function isConfigured() {
    return !!firebaseConfig && ready;
  }

  function pushScore(player, points) {
    if (!ready) return Promise.resolve();
    return db.ref("leaderboard/" + player.id).set({
      name: player.name,
      points: points,
      avatar: player.avatar || null,
      updatedAt: Date.now()
    });
  }

  function fetchLeaderboard() {
    if (!ready) return Promise.resolve([]);
    return db.ref("leaderboard").once("value").then(function (snap) {
      var val = snap.val() || {};
      return Object.keys(val).map(function (id) {
        return { id: id, name: val[id].name, points: val[id].points, avatar: val[id].avatar };
      });
    });
  }

  function pushTeamScores(teamScores) {
    if (!ready) return Promise.resolve();
    return db.ref("teamScores").set(teamScores);
  }

  init();

  global.EQSync = {
    isConfigured: isConfigured,
    pushScore: pushScore,
    fetchLeaderboard: fetchLeaderboard,
    pushTeamScores: pushTeamScores
  };
})(window);
