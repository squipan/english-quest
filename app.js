/* ============================================================
   English Quest — App Engine
   Vanilla JS, IIFE module pattern. No build step required.
   ============================================================ */
(function () {
  "use strict";

  var CONTENT = window.EQ_CONTENT;
  var I18N = window.EQ_I18N;
  var t = I18N.t;
  var $ = function (sel) { return document.querySelector(sel); };
  var $all = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  function applyStaticI18n() {
    $all("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    $("#langToggleBtn") && ($("#langToggleBtn").textContent = I18N.getLang() === "ja" ? "EN" : "日本語");
    $("#langToggleBtnOnboard") && ($("#langToggleBtnOnboard").textContent = I18N.getLang() === "ja" ? "EN" : "日本語");
  }

  function toggleLang() {
    I18N.setLang(I18N.getLang() === "ja" ? "en" : "ja");
    applyStaticI18n();
    renderTopbar();
    renderUnitGrid();
  }

  $("#langToggleBtn") && $("#langToggleBtn").addEventListener("click", toggleLang);
  $("#langToggleBtnOnboard") && $("#langToggleBtnOnboard").addEventListener("click", toggleLang);

  // ---------------------------------------------------------
  // Storage helpers
  // ---------------------------------------------------------
  var Store = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
    },
    remove: function (key) {
      try { localStorage.removeItem(key); } catch (e) {}
    }
  };

  var KEYS = {
    player: "eq_player",
    points: "eq_points",
    unitProgress: "eq_unit_progress",
    teams: "eq_teams",
    teamScores: "eq_team_scores",
    leaderboardCache: "eq_leaderboard_cache",
    pendingSync: "eq_pending_sync"
  };

  // Kept OUTSIDE of KEYS on purpose: a pending delete request must survive
  // the localStorage wipe that happens immediately on reset, so it can
  // still be retried against Firebase next time the device is online.
  var PENDING_DELETE_KEY = "eq_pending_delete_id";

  var AVATAR_BASES = ["🧙‍♂️", "🧝‍♀️", "🤺", "🦸‍♂️", "🧑‍🚀", "🧛‍♂️", "🧚‍♀️", "🤖"];
  var AVATAR_WEAPONS = ["⚔️", "🏹", "🔱", "🔥", "❄️", "⚡", "🛡️", "🗡️"];
  var AVATAR_COLORS = ["#ffc145", "#4ce0d2", "#ff5d8f", "#6be37a", "#9d7bff", "#ff8a4c"];
  var DEFAULT_AVATAR = { base: AVATAR_BASES[0], weapon: AVATAR_WEAPONS[0], color: AVATAR_COLORS[0] };

  function getAvatar() {
    return (player && player.avatar) ? player.avatar : DEFAULT_AVATAR;
  }

  function uid() {
    return "p_" + Math.random().toString(36).slice(2, 10);
  }

  // ---------------------------------------------------------
  // Player state
  // ---------------------------------------------------------
  var player = Store.get(KEYS.player, null);
  var totalPoints = Store.get(KEYS.points, 0);

  function savePlayer() { Store.set(KEYS.player, player); }
  function addPoints(n) {
    totalPoints += n;
    Store.set(KEYS.points, totalPoints);
    var pending = Store.get(KEYS.pendingSync, 0);
    Store.set(KEYS.pendingSync, pending + n);
    renderTopbar();
    trySync();
  }

  // ---------------------------------------------------------
  // Screen navigation
  // ---------------------------------------------------------
  function showScreen(id) {
    $all(".screen").forEach(function (s) { s.classList.remove("active"); });
    var target = document.getElementById(id);
    if (target) target.classList.add("active");
    $all(".tab-btn").forEach(function (t) {
      t.classList.toggle("active", t.dataset.target === id);
    });
    if (id === "screen-leaderboard") renderLeaderboard();
    if (id === "screen-home") renderUnitGrid();
    window.scrollTo(0, 0);
  }

  function renderTopbar() {
    var tag = $("#topbarTag");
    if (!tag) return;
    if (player) {
      var av = getAvatar();
      tag.innerHTML = '<span style="margin-right:4px">' + av.base + av.weapon + '</span>' +
        t("adventurer") + " <strong>" + escapeHtml(player.name) + "</strong>";
    } else {
      tag.textContent = t("welcome");
    }
    $("#topbarPoints").textContent = totalPoints + " pt";
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---------------------------------------------------------
  // Onboarding
  // ---------------------------------------------------------
  function initOnboarding() {
    if (player) {
      $("#topbarRow").style.display = "flex";
      showScreen("screen-home");
      return;
    }
    showScreen("screen-onboard");
  }

  $("#onboardForm") && $("#onboardForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("#onboardName").value.trim();
    if (!name) return;
    player = { id: uid(), name: name, createdAt: Date.now(), avatar: Object.assign({}, DEFAULT_AVATAR) };
    savePlayer();
    avatarPick = Object.assign({}, DEFAULT_AVATAR);
    renderAvatarPicker();
    showScreen("screen-avatar");
  });

  // ---------------------------------------------------------
  // Avatar maker
  // ---------------------------------------------------------
  var avatarPick = Object.assign({}, DEFAULT_AVATAR);

  function renderAvatarPicker() {
    var baseGrid = $("#avatarBaseGrid");
    var weaponGrid = $("#avatarWeaponGrid");
    var colorGrid = $("#avatarColorGrid");
    baseGrid.innerHTML = "";
    weaponGrid.innerHTML = "";
    colorGrid.innerHTML = "";

    AVATAR_BASES.forEach(function (emoji) {
      var b = document.createElement("button");
      b.className = "pick-btn" + (avatarPick.base === emoji ? " selected" : "");
      b.type = "button";
      b.textContent = emoji;
      b.addEventListener("click", function () { avatarPick.base = emoji; updateAvatarPreview(); renderAvatarPicker(); });
      baseGrid.appendChild(b);
    });
    AVATAR_WEAPONS.forEach(function (emoji) {
      var b = document.createElement("button");
      b.className = "pick-btn" + (avatarPick.weapon === emoji ? " selected" : "");
      b.type = "button";
      b.textContent = emoji;
      b.addEventListener("click", function () { avatarPick.weapon = emoji; updateAvatarPreview(); renderAvatarPicker(); });
      weaponGrid.appendChild(b);
    });
    AVATAR_COLORS.forEach(function (color) {
      var b = document.createElement("button");
      b.className = "pick-btn color-swatch" + (avatarPick.color === color ? " selected" : "");
      b.type = "button";
      b.innerHTML = '<span class="swatch-dot" style="background:' + color + '"></span>';
      b.addEventListener("click", function () { avatarPick.color = color; updateAvatarPreview(); renderAvatarPicker(); });
      colorGrid.appendChild(b);
    });
    updateAvatarPreview();
  }

  function updateAvatarPreview() {
    $("#avatarPreviewCircle").textContent = avatarPick.base;
    $("#avatarPreviewCircle").style.borderColor = avatarPick.color;
    $("#avatarPreviewWeapon").textContent = avatarPick.weapon;
    $("#avatarPreviewName").textContent = player ? player.name : "";
  }

  $("#avatarConfirmBtn") && $("#avatarConfirmBtn").addEventListener("click", function () {
    player.avatar = Object.assign({}, avatarPick);
    savePlayer();
    $("#topbarRow").style.display = "flex";
    renderTopbar();
    showScreen("screen-home");
  });

  // ---------------------------------------------------------
  // Unit grid (home)
  // ---------------------------------------------------------
  var unitProgress = Store.get(KEYS.unitProgress, {});

  function renderUnitGrid() {
    var grid = $("#unitGrid");
    if (!grid) return;
    grid.innerHTML = "";
    CONTENT.UNITS.forEach(function (unit) {
      var done = unitProgress[unit.id] || 0;
      var card = document.createElement("button");
      card.className = "unit-card";
      card.innerHTML =
        '<span class="emoji">' + unit.emoji + "</span>" +
        '<span class="name">' + escapeHtml(unit.name) + "</span>" +
        '<span class="lvl">Eiken ' + unit.level + "級 · ★" + done + "</span>";
      card.addEventListener("click", function () { startQuizBattle(unit); });
      grid.appendChild(card);
    });
  }

  // ---------------------------------------------------------
  // Solo Quiz Battle (monster fight)
  // ---------------------------------------------------------
  var MONSTERS = ["👾", "🐲", "👹", "🦑", "🐙", "🦂", "🐍", "🧌"];
  var battle = null;

  function buildQuizQuestions(unit, count) {
    var pool = unit.words.slice();
    shuffle(pool);
    pool = pool.slice(0, Math.min(count, pool.length));
    return pool.map(function (w) {
      var distractors = unit.words.filter(function (x) { return x.en !== w.en; });
      shuffle(distractors);
      var options = [w].concat(distractors.slice(0, 3));
      shuffle(options);
      return { prompt: w.ja, answer: w.en, options: options.map(function (o) { return o.en; }) };
    });
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function showDmgPop(selector, text) {
    var el = $(selector);
    if (!el) return;
    el.textContent = text;
    el.classList.remove("show");
    void el.offsetWidth; // restart animation
    el.classList.add("show");
  }

  function startQuizBattle(unit) {
    var qs = buildQuizQuestions(unit, 8);
    battle = {
      unit: unit,
      questions: qs,
      index: 0,
      monsterHp: qs.length,
      monsterMaxHp: qs.length,
      correctCount: 0,
      monster: MONSTERS[Math.floor(Math.random() * MONSTERS.length)]
    };
    $("#battleUnitName").textContent = unit.emoji + " " + unit.name;
    var av = getAvatar();
    $("#playerCombatEmoji").textContent = av.base;
    $("#playerCombatWeapon").textContent = av.weapon;
    $("#playerCombatEmoji").style.color = av.color;
    renderBattle();
    showScreen("screen-battle");
  }

  function renderBattle() {
    if (!battle) return;
    var q = battle.questions[battle.index];
    if (!q) { return endBattle(); }
    $("#monsterEmoji").textContent = battle.monster;
    $("#monsterEmoji").classList.remove("hit", "attack", "flash-hurt");
    $("#playerCombatEmoji").classList.remove("attack", "flash-hurt");
    $("#hpFill").style.width = (battle.monsterHp / battle.monsterMaxHp * 100) + "%";
    $("#hpLabel").textContent = "Monster HP " + battle.monsterHp + "/" + battle.monsterMaxHp;
    $("#battleProgress").textContent = "Q" + (battle.index + 1) + "/" + battle.questions.length;
    $("#questionText").textContent = q.prompt;
    var grid = $("#optionsGrid");
    grid.innerHTML = "";
    $("#feedbackBanner").textContent = "";
    $("#feedbackBanner").className = "feedback-banner";
    q.options.forEach(function (opt) {
      var btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = opt;
      btn.addEventListener("click", function () { answerBattle(opt, btn); });
      grid.appendChild(btn);
    });
  }

  function answerBattle(opt, btnEl) {
    if (!battle) return;
    var q = battle.questions[battle.index];
    var correct = opt === q.answer;
    $all(".option-btn").forEach(function (b) {
      b.style.pointerEvents = "none";
      if (b.textContent === q.answer) b.classList.add("correct");
      else if (b === btnEl) b.classList.add("wrong");
    });
    if (correct) {
      battle.monsterHp = Math.max(0, battle.monsterHp - 1);
      battle.correctCount++;
      $("#playerCombatEmoji").classList.add("attack");
      setTimeout(function () {
        $("#monsterEmoji").classList.add("hit", "flash-hurt");
        showDmgPop("#monsterDmgPop", "-1");
      }, 200);
      $("#feedbackBanner").textContent = t("hitText") + " " + q.answer;
      $("#feedbackBanner").classList.add("correct");
      addPoints(10);
    } else {
      $("#monsterEmoji").classList.add("attack");
      setTimeout(function () { $("#playerCombatEmoji").classList.add("flash-hurt"); }, 200);
      $("#feedbackBanner").textContent = t("missText") + " " + q.answer;
      $("#feedbackBanner").classList.add("wrong");
    }
    $("#hpFill").style.width = (battle.monsterHp / battle.monsterMaxHp * 100) + "%";
    setTimeout(function () {
      battle.index++;
      renderBattle();
    }, 1000);
  }

  function endBattle() {
    var won = battle.correctCount === battle.questions.length;
    unitProgress[battle.unit.id] = (unitProgress[battle.unit.id] || 0) + (won ? 1 : 0);
    Store.set(KEYS.unitProgress, unitProgress);
    if (won) addPoints(20);
    $("#resultTitle").textContent = won ? t("victory") : t("battleComplete");
    $("#resultPoints").textContent = (battle.correctCount * 10) + (won ? 20 : 0);
    $("#resultDetail").textContent = battle.correctCount + " / " + battle.questions.length + " correct";
    battle = null;
    showScreen("screen-result");
  }

  // ---------------------------------------------------------
  // Sentence Builder (word order)
  // ---------------------------------------------------------
  var builder = null;

  function startSentenceBuilder() {
    var pool = CONTENT.SENTENCES.slice();
    shuffle(pool);
    builder = { items: pool.slice(0, 6), index: 0, correctCount: 0 };
    renderBuilder();
    showScreen("screen-builder");
  }

  function renderBuilder() {
    var item = builder.items[builder.index];
    if (!item) return endBuilder();
    $("#builderProgress").textContent = "Q" + (builder.index + 1) + "/" + builder.items.length;
    $("#builderJa").textContent = item.ja;
    var tokens = item.tokens.slice();
    shuffle(tokens);
    builder.current = { correct: item.tokens, placed: [], bank: tokens };
    renderBuilderUI();
  }

  function renderBuilderUI() {
    var bank = $("#tokenBank");
    var slots = $("#tokenSlots");
    bank.innerHTML = "";
    slots.innerHTML = "";
    builder.current.bank.forEach(function (tok, i) {
      var chip = document.createElement("button");
      chip.className = "token-chip";
      chip.textContent = tok;
      chip.addEventListener("click", function () { placeToken(i); });
      bank.appendChild(chip);
    });
    builder.current.placed.forEach(function (tok) {
      var chip = document.createElement("div");
      chip.className = "token-chip placed";
      chip.textContent = tok;
      slots.appendChild(chip);
    });
    $("#builderFeedback").textContent = "";
    $("#builderFeedback").className = "feedback-banner";
  }

  function placeToken(i) {
    var tok = builder.current.bank.splice(i, 1)[0];
    builder.current.placed.push(tok);
    renderBuilderUI();
    if (builder.current.bank.length === 0) checkBuilder();
  }

  function checkBuilder() {
    var correct = builder.current.placed.join("|") === builder.current.correct.join("|");
    var fb = $("#builderFeedback");
    if (correct) {
      fb.textContent = t("correctText");
      fb.classList.add("correct");
      builder.correctCount++;
      addPoints(15);
    } else {
      fb.textContent = t("wrongOrderText") + " " + builder.current.correct.join(" ");
      fb.classList.add("wrong");
    }
    setTimeout(function () {
      builder.index++;
      renderBuilder();
    }, 1400);
  }

  function endBuilder() {
    $("#resultTitle").textContent = t("questComplete");
    $("#resultPoints").textContent = builder.correctCount * 15;
    $("#resultDetail").textContent = builder.correctCount + " / " + builder.items.length + " correct";
    builder = null;
    showScreen("screen-result");
  }

  // ---------------------------------------------------------
  // Team setup
  // ---------------------------------------------------------
  var TEAM_COLORS = ["#ff5d8f", "#4ce0d2", "#ffc145", "#6be37a", "#9d7bff", "#ff8a4c"];
  var teamsConfig = Store.get(KEYS.teams, null);

  function renderTeamSetup() {
    var list = $("#teamList");
    list.innerHTML = "";
    if (!teamsConfig) teamsConfig = { teams: [{ name: "Team 1" }, { name: "Team 2" }] };
    teamsConfig.teams.forEach(function (t, i) {
      if (!t.crest) t.crest = { base: AVATAR_BASES[i % AVATAR_BASES.length], color: TEAM_COLORS[i % TEAM_COLORS.length] };
      var row = document.createElement("div");
      row.className = "team-row";
      var crestBtn = document.createElement("button");
      crestBtn.type = "button";
      crestBtn.className = "pick-btn";
      crestBtn.style.fontSize = "20px";
      crestBtn.style.borderColor = t.crest.color;
      crestBtn.textContent = t.crest.base;
      crestBtn.title = "Tap to change crest";
      crestBtn.addEventListener("click", function () {
        var idx = AVATAR_BASES.indexOf(t.crest.base);
        t.crest.base = AVATAR_BASES[(idx + 1) % AVATAR_BASES.length];
        var cidx = TEAM_COLORS.indexOf(t.crest.color);
        t.crest.color = TEAM_COLORS[(cidx + 1) % TEAM_COLORS.length];
        crestBtn.textContent = t.crest.base;
        crestBtn.style.borderColor = t.crest.color;
      });
      row.appendChild(crestBtn);
      var input = document.createElement("input");
      input.type = "text";
      input.value = t.name;
      input.addEventListener("input", function () { t.name = input.value; });
      row.appendChild(input);
      var del = document.createElement("button");
      del.className = "btn ghost";
      del.style.width = "auto";
      del.style.padding = "6px 10px";
      del.textContent = "✕";
      del.addEventListener("click", function () {
        teamsConfig.teams.splice(i, 1);
        renderTeamSetup();
      });
      row.appendChild(del);
      list.appendChild(row);
    });
  }

  $("#addTeamBtn") && $("#addTeamBtn").addEventListener("click", function () {
    teamsConfig.teams.push({ name: "Team " + (teamsConfig.teams.length + 1) });
    renderTeamSetup();
  });

  $("#saveTeamsBtn") && $("#saveTeamsBtn").addEventListener("click", function () {
    Store.set(KEYS.teams, teamsConfig);
    var scores = Store.get(KEYS.teamScores, {});
    teamsConfig.teams.forEach(function (t) { if (!(t.name in scores)) scores[t.name] = 0; });
    Store.set(KEYS.teamScores, scores);
    startTeamBattle();
  });

  // ---------------------------------------------------------
  // Team Boss Battle (shared-device, pass-the-phone / projector)
  // ---------------------------------------------------------
  var teamBattle = null;

  function startTeamBattle() {
    var allWords = [];
    CONTENT.UNITS.forEach(function (u) { allWords = allWords.concat(u.words.map(function (w) { return { w: w, level: u.level }; })); });
    shuffle(allWords);
    var qs = allWords.slice(0, 12).map(function (entry) {
      var w = entry.w;
      var distractors = allWords.filter(function (x) { return x.w.en !== w.en; });
      shuffle(distractors);
      var options = [w].concat(distractors.slice(0, 3).map(function (d) { return d.w; }));
      shuffle(options);
      return { prompt: w.ja, answer: w.en, options: options.map(function (o) { return o.en; }) };
    });
    teamBattle = {
      questions: qs,
      index: 0,
      bossHp: qs.length,
      bossMaxHp: qs.length,
      teamIndex: 0
    };
    renderTeamBattle();
    showScreen("screen-teambattle");
  }

  function currentTeam() {
    return teamsConfig.teams[teamBattle.teamIndex % teamsConfig.teams.length];
  }

  function renderTeamBattle() {
    var q = teamBattle.questions[teamBattle.index];
    if (!q) return endTeamBattle();
    var team = currentTeam();
    $("#tbTurn").textContent = "🎯 " + team.name + t("teamTurn");
    $("#tbTeamCrestEmoji").textContent = team.crest ? team.crest.base : "🛡️";
    $("#tbTeamCrestEmoji").style.color = team.crest ? team.crest.color : "";
    $("#tbBossEmoji").classList.remove("hit", "attack", "flash-hurt");
    $("#tbTeamCrestEmoji").classList.remove("attack", "flash-hurt");
    $("#tbBossHpFill").style.width = (teamBattle.bossHp / teamBattle.bossMaxHp * 100) + "%";
    $("#tbBossHpLabel").textContent = "Boss HP " + teamBattle.bossHp + "/" + teamBattle.bossMaxHp;
    $("#tbProgress").textContent = "Q" + (teamBattle.index + 1) + "/" + teamBattle.questions.length;
    $("#tbQuestionText").textContent = q.prompt;
    var grid = $("#tbOptionsGrid");
    grid.innerHTML = "";
    $("#tbFeedback").textContent = "";
    $("#tbFeedback").className = "feedback-banner";
    q.options.forEach(function (opt) {
      var btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = opt;
      btn.addEventListener("click", function () { answerTeamBattle(opt, btn); });
      grid.appendChild(btn);
    });
    renderTeamScoreboard();
  }

  function renderTeamScoreboard() {
    var scores = Store.get(KEYS.teamScores, {});
    var board = $("#tbScoreboard");
    board.innerHTML = teamsConfig.teams.map(function (t, i) {
      return '<span class="points-badge" style="border-color:' + TEAM_COLORS[i % TEAM_COLORS.length] + '">' +
        escapeHtml(t.name) + ": " + (scores[t.name] || 0) + "</span>";
    }).join(" ");
  }

  function answerTeamBattle(opt, btnEl) {
    var q = teamBattle.questions[teamBattle.index];
    var correct = opt === q.answer;
    $all("#tbOptionsGrid .option-btn").forEach(function (b) {
      b.style.pointerEvents = "none";
      if (b.textContent === q.answer) b.classList.add("correct");
      else if (b === btnEl) b.classList.add("wrong");
    });
    var team = currentTeam();
    var scores = Store.get(KEYS.teamScores, {});
    if (correct) {
      teamBattle.bossHp = Math.max(0, teamBattle.bossHp - 1);
      scores[team.name] = (scores[team.name] || 0) + 10;
      $("#tbTeamCrestEmoji").classList.add("attack");
      setTimeout(function () {
        $("#tbBossEmoji").classList.add("hit", "flash-hurt");
        showDmgPop("#tbBossDmgPop", "-1");
      }, 200);
      $("#tbFeedback").textContent = team.name + " " + t("bossHit");
      $("#tbFeedback").classList.add("correct");
    } else {
      $("#tbBossEmoji").classList.add("attack");
      setTimeout(function () { $("#tbTeamCrestEmoji").classList.add("flash-hurt"); }, 200);
      $("#tbFeedback").textContent = t("noDamage") + " " + q.answer;
      $("#tbFeedback").classList.add("wrong");
    }
    Store.set(KEYS.teamScores, scores);
    $("#tbBossHpFill").style.width = (teamBattle.bossHp / teamBattle.bossMaxHp * 100) + "%";
    renderTeamScoreboard();
    setTimeout(function () {
      teamBattle.index++;
      teamBattle.teamIndex++;
      renderTeamBattle();
    }, 1100);
  }

  function endTeamBattle() {
    var scores = Store.get(KEYS.teamScores, {});
    var ranked = teamsConfig.teams.slice().sort(function (a, b) { return (scores[b.name] || 0) - (scores[a.name] || 0); });
    $("#resultTitle").textContent = teamBattle.bossHp <= 0 ? t("bossDefeated") : t("battleComplete");
    $("#resultPoints").textContent = scores[ranked[0].name] || 0;
    $("#resultDetail").textContent = t("topTeam") + " " + ranked[0].name;
    addPoints(5); // small personal reward for participating
    teamBattle = null;
    showScreen("screen-result");
  }

  // ---------------------------------------------------------
  // Leaderboard + sync (Firebase optional, see sync.js)
  // ---------------------------------------------------------
  function renderLeaderboard() {
    var list = $("#lbList");
    var pill = $("#syncPill");
    var localEntry = { name: player ? player.name : "You", points: totalPoints, id: player ? player.id : "me", avatar: getAvatar() };
    var cached = Store.get(KEYS.leaderboardCache, []);
    var merged = cached.filter(function (e) { return e.id !== localEntry.id; }).concat([localEntry]);
    merged.sort(function (a, b) { return b.points - a.points; });
    list.innerHTML = merged.map(function (e, i) {
      var mine = player && e.id === player.id;
      var avTag = e.avatar ? (e.avatar.base + " ") : "";
      return '<div class="lb-row' + (mine ? " me" : "") + '">' +
        '<span class="lb-rank">' + (i + 1) + '</span>' +
        '<span class="lb-name">' + avTag + escapeHtml(e.name) + (mine ? " (you)" : "") + '</span>' +
        '<span class="lb-pts">' + e.points + ' pt</span></div>';
    }).join("");

    if (window.EQSync && window.EQSync.isConfigured()) {
      pill.textContent = navigator.onLine ? t("syncOn") : t("syncWaiting");
      pill.classList.toggle("offline", !navigator.onLine);
    } else {
      pill.textContent = t("syncOff");
      pill.classList.add("offline");
    }
  }

  function trySync() {
    // First, retry any pending delete from a previous offline reset.
    processPendingDelete();

    if (window.EQSync && window.EQSync.isConfigured() && navigator.onLine && player) {
      window.EQSync.pushScore(player, totalPoints).then(function () {
        Store.set(KEYS.pendingSync, 0);
      }).catch(function () {});
      window.EQSync.fetchLeaderboard().then(function (rows) {
        Store.set(KEYS.leaderboardCache, rows);
      }).catch(function () {});
    }
  }

  window.addEventListener("online", trySync);

  // ---------------------------------------------------------
  // Reset / Start Over (deletes local data + leaderboard entry)
  // ---------------------------------------------------------
  function processPendingDelete() {
    var pendingId = Store.get(PENDING_DELETE_KEY, null);
    if (!pendingId) return;
    if (window.EQSync && window.EQSync.isConfigured() && navigator.onLine) {
      window.EQSync.deleteScore(pendingId).then(function () {
        Store.remove(PENDING_DELETE_KEY);
      }).catch(function () {
        // leave pendingId in place, will retry next time
      });
    }
  }

  function resetPlayer() {
    var confirmMsg = (I18N.getLang() === "ja")
      ? "本当に削除しますか？スコアと進行状況がすべて消えます。この操作は取り消せません。"
      : "Are you sure? This will permanently delete your scores and progress.";
    if (!window.confirm(confirmMsg)) return;

    if (player && player.id) {
      if (window.EQSync && window.EQSync.isConfigured() && navigator.onLine) {
        // Try to delete immediately; if it fails, fall back to queuing.
        window.EQSync.deleteScore(player.id).catch(function () {
          Store.set(PENDING_DELETE_KEY, player.id);
        });
      } else {
        // Offline (or sync not configured yet) — queue it for later.
        Store.set(PENDING_DELETE_KEY, player.id);
      }
    }

    // Wipe all local game data EXCEPT the pending-delete marker above,
    // which lives outside the KEYS object specifically so it survives this.
    Object.keys(KEYS).forEach(function (k) { Store.remove(KEYS[k]); });

    location.reload();
  }

  $("#resetPlayerBtn") && $("#resetPlayerBtn").addEventListener("click", resetPlayer);

  // ---------------------------------------------------------
  // Nav wiring
  // ---------------------------------------------------------
  $all(".tab-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { showScreen(btn.dataset.target); });
  });
  $all("[data-nav]").forEach(function (btn) {
    btn.addEventListener("click", function () { showScreen(btn.dataset.nav); });
  });
  $("#startBuilderBtn") && $("#startBuilderBtn").addEventListener("click", startSentenceBuilder);
  $("#goTeamSetupBtn") && $("#goTeamSetupBtn").addEventListener("click", function () {
    renderTeamSetup();
    showScreen("screen-teamsetup");
  });
  $("#resultHomeBtn") && $("#resultHomeBtn").addEventListener("click", function () { showScreen("screen-home"); });
  $("#resultAgainBtn") && $("#resultAgainBtn").addEventListener("click", function () { showScreen("screen-home"); });

  // ---------------------------------------------------------
  // Init
  // ---------------------------------------------------------
  renderTopbar();
  applyStaticI18n();
  initOnboarding();
  trySync();

  // expose for debugging in console
  window.EQ = { Store: Store, KEYS: KEYS };
})();
