// Nepal Grade 3 CDC Aligned English Themes & Solvable Difficulty Progression Curve

export const LEVELS = [
  {
    id: 1,
    title: "Sunrise Peak (Starter Tutorial)",
    subtitle: "Opposites / Antonyms (सजिलो विपरीत शब्द)",
    description: "Learn Mahjong! Match opposite words from the glowing outer edges and top peak.",
    relationshipType: "Opposites",
    mascotTip: "Welcome! Pick tiles from the open outer ends and top tier first to unlock the tiles underneath!",
    themeColor: "#0284c7",
    bgGradient: "linear-gradient(180deg, #38bdf8 0%, #0284c7 60%, #0369a1 100%)",
    vocabularyPool: [
      { id: "e1", word1: "Hot", word2: "Cold", icon1: "🔥", icon2: "❄️", relation: "Opposites" },
      { id: "e2", word1: "Big", word2: "Small", icon1: "🐘", icon2: "🐜", relation: "Opposites" },
      { id: "e3", word1: "Happy", word2: "Sad", icon1: "😊", icon2: "😢", relation: "Opposites" },
      { id: "e4", word1: "Fast", word2: "Slow", icon1: "🐆", icon2: "🐢", relation: "Opposites" },
      { id: "e5", word1: "Day", word2: "Night", icon1: "☀️", icon2: "🌙", relation: "Opposites" },
      { id: "e6", word1: "Up", word2: "Down", icon1: "🎈", icon2: "⚓", relation: "Opposites" },
      { id: "e7", word1: "Open", word2: "Close", icon1: "📖", icon2: "📕", relation: "Opposites" },
      { id: "e8", word1: "Clean", word2: "Dirty", icon1: "✨", icon2: "🧦", relation: "Opposites" }
    ],
    // 12-Tile Gentle Starter Layout (2 layers, stepped wings, clear entry points)
    starTimes: { threeStars: 50, twoStars: 90 },
    layout: [
      // Layer 0: Stepped base (10 tiles)
      { x: 0, y: 1, z: 0 }, { x: 8, y: 1, z: 0 },
      { x: 2, y: 1, z: 0 }, { x: 4, y: 1, z: 0 }, { x: 6, y: 1, z: 0 },
      { x: 0, y: 3, z: 0 }, { x: 8, y: 3, z: 0 },
      { x: 2, y: 3, z: 0 }, { x: 4, y: 3, z: 0 }, { x: 6, y: 3, z: 0 },

      // Layer 1: Top Peak bridge (2 tiles)
      { x: 3, y: 2, z: 1 }, { x: 5, y: 2, z: 1 }
    ]
  },
  {
    id: 2,
    title: "Word Twins Meadow",
    subtitle: "Synonyms (समानार्थी शब्द)",
    description: "Match words with the same meaning from the cross pattern wings!",
    relationshipType: "Synonyms",
    mascotTip: "Clearing the side wings reveals the center pillar!",
    themeColor: "#059669",
    bgGradient: "linear-gradient(180deg, #34d399 0%, #059669 60%, #047857 100%)",
    vocabularyPool: [
      { id: "s1", word1: "Happy", word2: "Glad", icon1: "😄", icon2: "🥳", relation: "Synonyms" },
      { id: "s2", word1: "Big", word2: "Large", icon1: "🏔️", icon2: "🏰", relation: "Synonyms" },
      { id: "s3", word1: "Quick", word2: "Fast", icon1: "⚡", icon2: "🐆", relation: "Synonyms" },
      { id: "s4", word1: "Tiny", word2: "Small", icon1: "🌱", icon2: "🐜", relation: "Synonyms" },
      { id: "s5", word1: "Start", word2: "Begin", icon1: "🚀", icon2: "🟢", relation: "Synonyms" },
      { id: "s6", word1: "Smart", word2: "Clever", icon1: "💡", icon2: "🦊", relation: "Synonyms" },
      { id: "s7", word1: "Neat", word2: "Tidy", icon1: "🧼", icon2: "🧹", relation: "Synonyms" },
      { id: "s8", word1: "Shut", word2: "Close", icon1: "🚪", icon2: "🔒", relation: "Synonyms" },
      { id: "s9", word1: "Simple", word2: "Easy", icon1: "🧩", icon2: "👌", relation: "Synonyms" }
    ],
    // 16-Tile Cross Layout (2 layers)
    starTimes: { threeStars: 75, twoStars: 130 },
    layout: [
      // Layer 0: Wings and body (12 tiles)
      { x: 4, y: 0, z: 0 },
      { x: 0, y: 2, z: 0 }, { x: 2, y: 2, z: 0 }, { x: 4, y: 2, z: 0 }, { x: 6, y: 2, z: 0 }, { x: 8, y: 2, z: 0 },
      { x: 0, y: 4, z: 0 }, { x: 2, y: 4, z: 0 }, { x: 4, y: 4, z: 0 }, { x: 6, y: 4, z: 0 }, { x: 8, y: 4, z: 0 },
      { x: 4, y: 6, z: 0 },

      // Layer 1: Elevated Cross Deck (4 tiles)
      { x: 3, y: 2, z: 1 }, { x: 5, y: 2, z: 1 },
      { x: 3, y: 4, z: 1 }, { x: 5, y: 4, z: 1 }
    ]
  },
  {
    id: 3,
    title: "School & Nature Bridge",
    subtitle: "Word Associations & Action Pairs (सम्बन्धित शब्दहरू)",
    description: "Match school items, nature, and action words across the bridge!",
    relationshipType: "Partners",
    mascotTip: "What do you do with a Book? Read! Free the bridge towers first!",
    themeColor: "#d97706",
    bgGradient: "linear-gradient(180deg, #fbbf24 0%, #d97706 60%, #b45309 100%)",
    vocabularyPool: [
      { id: "a1", word1: "Book", word2: "Read", icon1: "📚", icon2: "👀", relation: "Partners" },
      { id: "a2", word1: "Pencil", word2: "Write", icon1: "✏️", icon2: "📝", relation: "Partners" },
      { id: "a3", word1: "Water", word2: "Drink", icon1: "💧", icon2: "🥤", relation: "Partners" },
      { id: "a4", word1: "Bird", word2: "Fly", icon1: "🐦", icon2: "🪽", relation: "Partners" },
      { id: "a5", word1: "Sun", word2: "Shine", icon1: "☀️", icon2: "✨", relation: "Partners" },
      { id: "a6", word1: "Bed", word2: "Sleep", icon1: "🛏️", icon2: "💤", relation: "Partners" },
      { id: "a7", word1: "Food", word2: "Eat", icon1: "🍎", icon2: "🍽️", relation: "Partners" },
      { id: "a8", word1: "Bell", word2: "Ring", icon1: "🔔", icon2: "🔊", relation: "Partners" },
      { id: "a9", word1: "Shoes", word2: "Walk", icon1: "👟", icon2: "🚶", relation: "Partners" },
      { id: "a10", word1: "Tree", word2: "Grow", icon1: "🌳", icon2: "🌱", relation: "Partners" }
    ],
    // 20-Tile 2-Layer Bridge Layout
    starTimes: { threeStars: 100, twoStars: 170 },
    layout: [
      // Layer 0: Bridge platform and pillars (16 tiles)
      { x: 0, y: 0, z: 0 }, { x: 8, y: 0, z: 0 },
      { x: 0, y: 2, z: 0 }, { x: 2, y: 2, z: 0 }, { x: 4, y: 2, z: 0 }, { x: 6, y: 2, z: 0 }, { x: 8, y: 2, z: 0 },
      { x: 0, y: 4, z: 0 }, { x: 2, y: 4, z: 0 }, { x: 4, y: 4, z: 0 }, { x: 6, y: 4, z: 0 }, { x: 8, y: 4, z: 0 },
      { x: 0, y: 6, z: 0 }, { x: 8, y: 6, z: 0 },
      { x: 4, y: 0, z: 0 }, { x: 4, y: 6, z: 0 },

      // Layer 1: Bridge Arch Ramp (4 tiles)
      { x: 2, y: 3, z: 1 }, { x: 4, y: 3, z: 1 }, { x: 6, y: 3, z: 1 },
      { x: 4, y: 1, z: 1 }
    ]
  },
  {
    id: 4,
    title: "The Himalayan Pagoda",
    subtitle: "Temple Solitaire (मिश्रित मन्दिर रचना)",
    description: "Clear the 3-tier pagoda roof and discover deeper word relationships!",
    relationshipType: "Pagoda Mix",
    mascotTip: "Dismantle the golden roof tier-by-tier to reach the base courtyard!",
    themeColor: "#0891b2",
    bgGradient: "linear-gradient(180deg, #22d3ee 0%, #0891b2 60%, #0e7490 100%)",
    vocabularyPool: [
      { id: "p1", word1: "Tall", word2: "Short", icon1: "🦒", icon2: "🐕", relation: "Opposites" },
      { id: "p2", word1: "Heavy", word2: "Light", icon1: "🪨", icon2: "🪶", relation: "Opposites" },
      { id: "p3", word1: "Silent", word2: "Quiet", icon1: "🤫", icon2: "🌙", relation: "Synonyms" },
      { id: "p4", word1: "Rich", word2: "Wealthy", icon1: "👑", icon2: "💰", relation: "Synonyms" },
      { id: "p5", word1: "Teacher", word2: "Teach", icon1: "🧑‍🏫", icon2: "🏫", relation: "Partners" },
      { id: "p6", word1: "Farmer", word2: "Plant", icon1: "🌾", icon2: "🚜", relation: "Partners" },
      { id: "p7", word1: "Rain", word2: "Wet", icon1: "🌧️", icon2: "☔", relation: "Partners" },
      { id: "p8", word1: "Hard", word2: "Soft", icon1: "🧱", icon2: "🧸", relation: "Opposites" },
      { id: "p9", word1: "Early", word2: "Late", icon1: "🌅", icon2: "⏰", relation: "Opposites" },
      { id: "p10", word1: "Clean", word2: "Tidy", icon1: "✨", icon2: "🧹", relation: "Synonyms" },
      { id: "p11", word1: "Friend", word2: "Pal", icon1: "🤝", icon2: "👦", relation: "Synonyms" },
      { id: "p12", word1: "Doctor", word2: "Heal", icon1: "🩺", icon2: "🩹", relation: "Partners" }
    ],
    // 24-Tile 3-Layer Pagoda Layout
    starTimes: { threeStars: 130, twoStars: 220 },
    layout: [
      // Layer 0: Base Tier (14 tiles)
      { x: 0, y: 3, z: 0 }, { x: 2, y: 3, z: 0 }, { x: 4, y: 3, z: 0 }, { x: 6, y: 3, z: 0 }, { x: 8, y: 3, z: 0 },
      { x: 0, y: 1, z: 0 }, { x: 8, y: 1, z: 0 },
      { x: 0, y: 5, z: 0 }, { x: 8, y: 5, z: 0 },
      { x: 2, y: 1, z: 0 }, { x: 6, y: 1, z: 0 },
      { x: 2, y: 5, z: 0 }, { x: 6, y: 5, z: 0 },
      { x: 4, y: 1, z: 0 },

      // Layer 1: Mid Roof Tier (8 tiles)
      { x: 2, y: 2, z: 1 }, { x: 4, y: 2, z: 1 }, { x: 6, y: 2, z: 1 },
      { x: 2, y: 4, z: 1 }, { x: 4, y: 4, z: 1 }, { x: 6, y: 4, z: 1 },
      { x: 4, y: 0, z: 1 }, { x: 4, y: 6, z: 1 },

      // Layer 2: Golden Spire (2 tiles)
      { x: 3, y: 3, z: 2 }, { x: 5, y: 3, z: 2 }
    ]
  },
  {
    id: 5,
    title: "The Mystic Snow Dragon",
    subtitle: "Master Solitaire Challenge (महा चुनौती)",
    description: "The ultimate 28-tile Grade 3 challenge featuring layered wings, claws, and spine!",
    relationshipType: "Master Mix",
    mascotTip: "Free the dragon's claws and outer wings first to unlock the crowned head!",
    themeColor: "#7c3aed",
    bgGradient: "linear-gradient(180deg, #a78bfa 0%, #7c3aed 60%, #6d28d9 100%)",
    vocabularyPool: [
      { id: "m1", word1: "Strong", word2: "Weak", icon1: "💪", icon2: "🍃", relation: "Opposites" },
      { id: "m2", word1: "Hot", word2: "Cold", icon1: "🔥", icon2: "❄️", relation: "Opposites" },
      { id: "m3", word1: "Fast", word2: "Quick", icon1: "⚡", icon2: "🐆", relation: "Synonyms" },
      { id: "m4", word1: "Happy", word2: "Glad", icon1: "😊", icon2: "🥳", relation: "Synonyms" },
      { id: "m5", word1: "Big", word2: "Large", icon1: "🏔️", icon2: "🐘", relation: "Synonyms" },
      { id: "m6", word1: "Clean", word2: "Dirty", icon1: "✨", icon2: "🧦", relation: "Opposites" },
      { id: "m7", word1: "Book", word2: "Read", icon1: "📚", icon2: "👀", relation: "Partners" },
      { id: "m8", word1: "Pencil", word2: "Write", icon1: "✏️", icon2: "📝", relation: "Partners" },
      { id: "m9", word1: "Water", word2: "Drink", icon1: "💧", icon2: "🥤", relation: "Partners" },
      { id: "m10", word1: "Bird", word2: "Fly", icon1: "🐦", icon2: "🪽", relation: "Partners" },
      { id: "m11", word1: "Friend", word2: "Pal", icon1: "🤝", icon2: "👦", relation: "Synonyms" },
      { id: "m12", word1: "Doctor", word2: "Heal", icon1: "🩺", icon2: "🩹", relation: "Partners" },
      { id: "m13", word1: "Quiet", word2: "Silent", icon1: "🤫", icon2: "🌙", relation: "Synonyms" },
      { id: "m14", word1: "Easy", word2: "Simple", icon1: "👌", icon2: "🧩", relation: "Synonyms" }
    ],
    // 28-Tile Balanced 3-Layer Dragon Layout (guaranteed unblocked entryways)
    starTimes: { threeStars: 160, twoStars: 260 },
    layout: [
      // Layer 0: Wings & Claws (18 tiles)
      { x: 0, y: 0, z: 0 }, { x: 8, y: 0, z: 0 },
      { x: 2, y: 1, z: 0 }, { x: 6, y: 1, z: 0 },
      { x: 0, y: 2, z: 0 }, { x: 2, y: 2, z: 0 }, { x: 4, y: 2, z: 0 }, { x: 6, y: 2, z: 0 }, { x: 8, y: 2, z: 0 },
      { x: 0, y: 4, z: 0 }, { x: 2, y: 4, z: 0 }, { x: 4, y: 4, z: 0 }, { x: 6, y: 4, z: 0 }, { x: 8, y: 4, z: 0 },
      { x: 2, y: 5, z: 0 }, { x: 6, y: 5, z: 0 },
      { x: 0, y: 6, z: 0 }, { x: 8, y: 6, z: 0 },

      // Layer 1: Dragon Crest & Spine (8 tiles)
      { x: 2, y: 3, z: 1 }, { x: 6, y: 3, z: 1 },
      { x: 4, y: 1, z: 1 }, { x: 4, y: 5, z: 1 },
      { x: 3, y: 2, z: 1 }, { x: 5, y: 2, z: 1 },
      { x: 3, y: 4, z: 1 }, { x: 5, y: 4, z: 1 },

      // Layer 2: Crown Horns (2 tiles)
      { x: 4, y: 2, z: 2 }, { x: 4, y: 4, z: 2 }
    ]
  }
];
