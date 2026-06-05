# Space Miner

A browser-based arcade space survival game built with CreateJS.

**Play now:** [space-miner.y1shubham.in](https://space-miner.y1shubham.in)

---

## About

Control a mining spaceship navigating through an asteroid field. Collect minerals to score points, activate power-ups to survive longer, and build combo multipliers for massive scores. The longer you survive, the harder it gets.

---

## Controls

| Input | Action |
|---|---|
| Mouse drag / Touch drag | Move ship |
| WASD | Move ship |
| Arrow keys | Move ship |
| P | Pause |

---

## Features

- **3 asteroid types** — Small (fast, 12 HP), Medium (standard, 22 HP), Large (slow, 38 HP)
- **4 resource types** — Iron, Silver, Gold, Diamond with weighted rarity
- **3 power-ups** — Shield (9s), Magnet (8s), Speed Boost (6s)
- **Combo system** — consecutive collects multiply score up to ×5
- **Difficulty scaling** — speed and spawn rate increase every level
- **Health bar** with color-coded status (green → yellow → red)
- **Particle effects** — collection bursts, speed trails, shield absorb rings
- **Procedural SFX** — Web Audio API hit, collect, combo, power-up, and game over sounds
- **Background music** — ambient menu music and upbeat gameplay music
- **Persistent stats** — high score, best combo, games played saved to localStorage
- **Mute toggle** — persistent preference across sessions

---

## Tech Stack

- **[CreateJS](https://createjs.com/)** — EaselJS (canvas rendering), TweenJS (animation), PreloadJS (assets)
- **Web Audio API** — procedural sound effects
- **HTML5 Audio** — background music (MP3)
- **Vanilla JavaScript (ES6+)** — no build tools, no bundler
- **localStorage** — persistent save data

---

## Music Credits

- **"Infinite Perspective"** by Kevin MacLeod — menu/home screen music
- **"Odyssey"** by Kevin MacLeod — gameplay music
- Licensed under [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)
- Source: [incompetech.com](https://incompetech.com)

---

## Author

**Shubham Yadav** — [y1shubham.in](https://y1shubham.in)
