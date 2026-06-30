/* ============================================================
   English Quest — i18n
   UI chrome can be shown in English or Japanese (toggle in topbar).
   Quiz CONTENT itself stays as-is (English words + Japanese meaning)
   since that's what students are practicing — this file only
   covers buttons, labels, titles, and instructions.
   ============================================================ */
(function (global) {
  "use strict";

  var STRINGS = {
    en: {
      appTagline: "Defeat monsters. Learn English. Earn points!",
      onboardLabel: "What's your name? (ニックネームでOK)",
      onboardPlaceholder: "e.g. Yuki",
      onboardBtn: "Start Adventure 🚀",
      onboardNextBtn: "Next: Make your hero →",
      avatarTitle: "Create your hero",
      avatarClassLabel: "Class",
      avatarWeaponLabel: "Weapon",
      avatarColorLabel: "Color",
      avatarConfirmBtn: "Begin Adventure 🚀",
      welcome: "Welcome!",
      adventurer: "Adventurer:",
      navMap: "Quest Map",
      navRanking: "Ranking",
      sectionUnits: "Choose a unit — Solo Quiz Battle",
      sectionOther: "Other quests",
      btnBuilder: "📜 Sentence Builder",
      btnTeam: "🛡️ Team Boss Battle",
      battleQuestionHint: "What does this word mean?",
      builderLabel: "Build the English sentence for:",
      teamSetupTitle: "Set up teams",
      teamSetupHint: "Pass this phone around, or project it on a screen — teams take turns answering together.",
      addTeam: "+ Add team",
      startTeamBattle: "Start Boss Battle ⚔️",
      resultBackBtn: "Back to Map 🗺️",
      resultPointsLabel: "points earned",
      leaderboardTitle: "Class Leaderboard",
      syncOn: "🟢 Synced with class server",
      syncWaiting: "🟡 Offline — will sync when online",
      syncOff: "📴 Offline mode — scores saved on this device only",
      victory: "Victory! 🏆",
      battleComplete: "Battle Complete",
      questComplete: "Quest Complete! 📜",
      bossDefeated: "Boss Defeated! 🏆",
      teamTurn: "'s turn",
      topTeam: "Top team:",
      hitText: "Hit! ⚔️",
      missText: "Missed! Answer:",
      correctText: "Correct! ✨",
      wrongOrderText: "Correct order:",
      bossHit: "hits the boss! ⚔️",
      noDamage: "No damage. Answer:",
      langToggleLabel: "EN"
    },
    ja: {
      appTagline: "モンスターをたおして、英語を学んで、ポイントをゲットしよう！",
      onboardLabel: "なまえを入力してね（ニックネームでOK）",
      onboardPlaceholder: "例：ゆうき",
      onboardBtn: "ぼうけんスタート 🚀",
      onboardNextBtn: "つぎへ：ヒーローを作る →",
      avatarTitle: "ヒーローを作ろう",
      avatarClassLabel: "クラス",
      avatarWeaponLabel: "武器",
      avatarColorLabel: "カラー",
      avatarConfirmBtn: "ぼうけんスタート 🚀",
      welcome: "ようこそ！",
      adventurer: "冒険者：",
      navMap: "クエストマップ",
      navRanking: "ランキング",
      sectionUnits: "ユニットをえらぶ — ソロクイズバトル",
      sectionOther: "ほかのクエスト",
      btnBuilder: "📜 文づくりクエスト",
      btnTeam: "🛡️ チームボスバトル",
      battleQuestionHint: "この単語の意味は？",
      builderLabel: "つぎの日本語を英語の文にしよう：",
      teamSetupTitle: "チームをつくる",
      teamSetupHint: "このスマホを順番に回すか、画面に映して、チームで力を合わせて答えよう。",
      addTeam: "＋ チームを追加",
      startTeamBattle: "ボスバトル開始 ⚔️",
      resultBackBtn: "マップにもどる 🗺️",
      resultPointsLabel: "ポイント獲得！",
      leaderboardTitle: "クラスランキング",
      syncOn: "🟢 クラスサーバーと同期中",
      syncWaiting: "🟡 オフライン — オンラインになったら同期します",
      syncOff: "📴 オフラインモード — スコアはこの端末にのみ保存されています",
      victory: "勝利！🏆",
      battleComplete: "バトル終了",
      questComplete: "クエストクリア！📜",
      bossDefeated: "ボスをたおした！🏆",
      teamTurn: "のばん",
      topTeam: "1位チーム：",
      hitText: "命中！⚔️",
      missText: "はずれ！正解：",
      correctText: "せいかい！✨",
      wrongOrderText: "正しい順番：",
      bossHit: "がボスにダメージ！⚔️",
      noDamage: "ダメージなし。正解：",
      langToggleLabel: "日本語"
    }
  };

  var current = (function () {
    try { return localStorage.getItem("eq_lang") || "ja"; } catch (e) { return "ja"; }
  })();

  function t(key) {
    var dict = STRINGS[current] || STRINGS.ja;
    return dict[key] !== undefined ? dict[key] : (STRINGS.en[key] || key);
  }

  function getLang() { return current; }

  function setLang(lang) {
    current = lang === "en" ? "en" : "ja";
    try { localStorage.setItem("eq_lang", current); } catch (e) {}
  }

  global.EQ_I18N = { t: t, getLang: getLang, setLang: setLang, STRINGS: STRINGS };
})(window);
