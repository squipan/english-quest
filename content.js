/* ============================================================
   English Quest — Content Data
   Eiken 5級 → 4級 level vocabulary & sentence patterns
   Edit this file to add/change words, units, or questions.
   ============================================================ */
(function (global) {
  "use strict";

  // ---- Units (themed word groups, roughly Eiken 5級 -> 4級 difficulty) ----
  var UNITS = [
    {
      id: "school",
      name: "School Life",
      emoji: "🏫",
      level: 5,
      words: [
        { en: "student", ja: "生徒" },
        { en: "teacher", ja: "先生" },
        { en: "classroom", ja: "教室" },
        { en: "textbook", ja: "教科書" },
        { en: "notebook", ja: "ノート" },
        { en: "pencil", ja: "鉛筆" },
        { en: "eraser", ja: "消しゴム" },
        { en: "homework", ja: "宿題" },
        { en: "test", ja: "テスト" },
        { en: "library", ja: "図書館" },
        { en: "lunch", ja: "昼食" },
        { en: "friend", ja: "友達" },
        { en: "club", ja: "部活" },
        { en: "subject", ja: "教科" },
        { en: "schedule", ja: "時間割" }
      ]
    },
    {
      id: "family",
      name: "Family & People",
      emoji: "👨‍👩‍👧‍👦",
      level: 5,
      words: [
        { en: "mother", ja: "母" },
        { en: "father", ja: "父" },
        { en: "sister", ja: "姉・妹" },
        { en: "brother", ja: "兄・弟" },
        { en: "grandmother", ja: "祖母" },
        { en: "grandfather", ja: "祖父" },
        { en: "family", ja: "家族" },
        { en: "baby", ja: "赤ちゃん" },
        { en: "uncle", ja: "おじ" },
        { en: "aunt", ja: "おば" },
        { en: "cousin", ja: "いとこ" },
        { en: "parents", ja: "両親" }
      ]
    },
    {
      id: "daily",
      name: "Daily Routine",
      emoji: "⏰",
      level: 5,
      words: [
        { en: "wake up", ja: "起きる" },
        { en: "get up", ja: "起き上がる" },
        { en: "brush", ja: "磨く" },
        { en: "eat", ja: "食べる" },
        { en: "drink", ja: "飲む" },
        { en: "study", ja: "勉強する" },
        { en: "play", ja: "遊ぶ" },
        { en: "sleep", ja: "眠る" },
        { en: "go home", ja: "帰宅する" },
        { en: "clean", ja: "掃除する" },
        { en: "watch", ja: "見る" },
        { en: "listen", ja: "聞く" }
      ]
    },
    {
      id: "food",
      name: "Food & Drink",
      emoji: "🍙",
      level: 5,
      words: [
        { en: "rice", ja: "ご飯" },
        { en: "bread", ja: "パン" },
        { en: "milk", ja: "牛乳" },
        { en: "water", ja: "水" },
        { en: "apple", ja: "りんご" },
        { en: "orange", ja: "オレンジ" },
        { en: "egg", ja: "卵" },
        { en: "fish", ja: "魚" },
        { en: "meat", ja: "肉" },
        { en: "vegetable", ja: "野菜" },
        { en: "delicious", ja: "おいしい" },
        { en: "hungry", ja: "お腹が空いた" }
      ]
    },
    {
      id: "town",
      name: "Town & Places",
      emoji: "🏙️",
      level: 4,
      words: [
        { en: "station", ja: "駅" },
        { en: "hospital", ja: "病院" },
        { en: "park", ja: "公園" },
        { en: "supermarket", ja: "スーパー" },
        { en: "restaurant", ja: "レストラン" },
        { en: "bookstore", ja: "本屋" },
        { en: "post office", ja: "郵便局" },
        { en: "bank", ja: "銀行" },
        { en: "museum", ja: "博物館" },
        { en: "convenience store", ja: "コンビニ" }
      ]
    },
    {
      id: "hobbies",
      name: "Hobbies & Sports",
      emoji: "⚽",
      level: 4,
      words: [
        { en: "soccer", ja: "サッカー" },
        { en: "baseball", ja: "野球" },
        { en: "basketball", ja: "バスケットボール" },
        { en: "tennis", ja: "テニス" },
        { en: "swimming", ja: "水泳" },
        { en: "drawing", ja: "絵を描くこと" },
        { en: "reading", ja: "読書" },
        { en: "singing", ja: "歌うこと" },
        { en: "dancing", ja: "踊ること" },
        { en: "guitar", ja: "ギター" }
      ]
    },
    {
      id: "weather-time",
      name: "Weather & Time",
      emoji: "☀️",
      level: 4,
      words: [
        { en: "sunny", ja: "晴れの" },
        { en: "rainy", ja: "雨の" },
        { en: "cloudy", ja: "曇りの" },
        { en: "snowy", ja: "雪の" },
        { en: "windy", ja: "風が強い" },
        { en: "today", ja: "今日" },
        { en: "tomorrow", ja: "明日" },
        { en: "yesterday", ja: "昨日" },
        { en: "morning", ja: "朝" },
        { en: "evening", ja: "夕方" }
      ]
    }
  ];

  // ---- Sentence-pattern questions (word-order builder) ----
  // tokens: words in CORRECT order. The game will shuffle them for the student.
  var SENTENCES = [
    { level: 5, tokens: ["I", "am", "a", "student", "."], ja: "私は学生です。" },
    { level: 5, tokens: ["She", "is", "my", "sister", "."], ja: "彼女は私の姉です。" },
    { level: 5, tokens: ["I", "eat", "breakfast", "every", "day", "."], ja: "私は毎日朝食を食べます。" },
    { level: 5, tokens: ["He", "plays", "soccer", "on", "Sunday", "."], ja: "彼は日曜日にサッカーをします。" },
    { level: 5, tokens: ["Do", "you", "like", "music", "?"], ja: "あなたは音楽が好きですか。" },
    { level: 5, tokens: ["What", "time", "is", "it", "?"], ja: "今何時ですか。" },
    { level: 5, tokens: ["This", "is", "my", "pencil", "."], ja: "これは私の鉛筆です。" },
    { level: 5, tokens: ["I", "am", "studying", "English", "now", "."], ja: "私は今英語を勉強しています。" },
    { level: 4, tokens: ["I", "went", "to", "school", "yesterday", "."], ja: "私は昨日学校に行きました。" },
    { level: 4, tokens: ["She", "did", "not", "eat", "lunch", "."], ja: "彼女は昼食を食べませんでした。" },
    { level: 4, tokens: ["Where", "is", "the", "station", "?"], ja: "駅はどこですか。" },
    { level: 4, tokens: ["I", "want", "to", "be", "a", "teacher", "."], ja: "私は先生になりたいです。" },
    { level: 4, tokens: ["He", "was", "playing", "tennis", "."], ja: "彼はテニスをしていました。" },
    { level: 4, tokens: ["Can", "you", "help", "me", "?"], ja: "手伝ってくれますか。" }
  ];

  global.EQ_CONTENT = { UNITS: UNITS, SENTENCES: SENTENCES };
})(window);
