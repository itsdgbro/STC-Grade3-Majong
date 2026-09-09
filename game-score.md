# Game Scoring & Progression System Documentation

**Project:** Grade 3 English Mahjong Solitaire (Save the Children)  
**Target Audience:** Grade 3 CDC Curriculum Students (Ages 8–9)  

---

## 1. Overview

The scoring and reward mechanism balances **pedagogical reinforcement**, **fairness across puzzle sizes**, and **positive encouragement**. As board sizes grow from 12 tiles (6 pairs) up to 28 tiles (14 pairs) across multi-tier layouts, the time quota and score bonuses scale dynamically.

---

## 2. Core Scoring Mechanics

### 2.1 Match Points
* **+100 Points:** Awarded for every correct pair matched and cleared from the board.
* **-100 Points (Undo Penalty):** If the student chooses to use the "Undo" button to reverse a move, 100 points are deducted (clamped to a minimum score of `0`).

### 2.2 Completion Speed Bonus
To reward quick recognition of English vocabulary pairs without punishing slower, deliberate learners:
* If a player completes the level within the **3-Star time threshold**, they earn a **Speed Bonus**:
  $$\text{Time Bonus} = (\text{3-Star Time Limit} - \text{Time Taken}) \times 5 \text{ pts}$$
* If the completion time exceeds the 3-star limit, no penalty is applied ($\text{Time Bonus} = 0$).

### 2.3 Total Level Score Formula
$$\text{Total Score} = (\text{Pairs Cleared} \times 100) + \text{Time Bonus}$$

---

## 3. Dynamic Level Quotas & Star Thresholds

Unlike uniform static timers, each level has customized time targets tailored to its **tile count**, **number of vertical layers**, and **spatial complexity**:

| Level | Level Name | Relationship Theme | Tiles | Pairs | Layers | 3-Star Limit (⭐×3) | 2-Star Limit (⭐×2) | 1-Star Limit (⭐×1) | Base Clear Score | Max Potential Score |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | **Sunrise Peak** | Opposites (विपरीत शब्द) | 12 | 6 | 2 | $\le$ **50s** | $\le$ 90s | > 90s | 600 pts | ~850 pts |
| **2** | **Word Twins Meadow** | Synonyms (समानार्थी शब्द) | 16 | 8 | 2 | $\le$ **75s** | $\le$ 130s | > 130s | 800 pts | ~1,175 pts |
| **3** | **School & Nature Bridge** | Word Associations (सम्बन्धित) | 20 | 10 | 2 | $\le$ **100s** | $\le$ 170s | > 170s | 1,000 pts | ~1,500 pts |
| **4** | **The Himalayan Pagoda** | Temple Mix (मिश्रित रचना) | 24 | 12 | 3 | $\le$ **130s** | $\le$ 220s | > 220s | 1,200 pts | ~1,850 pts |
| **5** | **The Mystic Snow Dragon** | Master Challenge (महा चुनौती) | 28 | 14 | 3 | $\le$ **160s** | $\le$ 260s | > 260s | 1,400 pts | ~2,200 pts |

---

## 4. Star Rating Criteria

* **⭐⭐⭐ (3 Stars):** `TimeTaken <= starTimes.threeStars`
  * Demonstrates mastery in vocabulary recognition and spatial Mahjong clearing order.
  * Awards full Speed Bonus.
* **⭐⭐ (2 Stars):** `starTimes.threeStars < TimeTaken <= starTimes.twoStars`
  * Solid performance; solved without major stalls.
* **⭐ (1 Star):** `TimeTaken > starTimes.twoStars`
  * Completed the level. Encourages the student that perseverance pays off.

---

## 5. Persistence & Progress Tracking

1. **High Scores:**
   * Saved persistently in `localStorage` under key `nepal_mahjong_grade3_progress_v2`.
   * Only the best score (`Math.max(previousHighScore, currentTotalScore)`) and highest star count (`Math.max(previousStars, currentStars)`) are retained per level.
2. **Progression Unlocking:**
   * Completing Level $N$ unlocks Level $N+1$.
   * Progress displays stars and completion status directly on the Level Selection screen.
