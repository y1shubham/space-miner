# Space Miner — Product Requirement Document (PRD)

## Project Name
Space Miner

## Live URL
[space-miner.y1shubham.in](https://space-miner.y1shubham.in)

---

## Project Overview

Space Miner is a single-player arcade-style space survival game built entirely with CreateJS (EaselJS, TweenJS, SoundJS, PreloadJS) and the Web Audio API. The player controls a mining spaceship navigating through asteroid fields, collecting valuable minerals, activating power-ups, and surviving as long as possible.

The game is mobile-first, portrait-oriented, and runs at 60 FPS on canvas with no external game engine dependencies beyond CreateJS.

---

## Project Goals

### Primary Goal
Build a polished frontend game demonstrating:
- CreateJS suite expertise (EaselJS, TweenJS, SoundJS, PreloadJS)
- Game loop architecture with delta-time updates
- Collision detection
- State management via screen transitions
- Procedural animation systems
- Performance-focused canvas rendering
- Web Audio API for procedural SFX

### Secondary Goal
Create a portfolio project showcasing advanced JavaScript and frontend engineering skills suitable for technical interview discussions.

---

## Target Audience
- Recruiters
- Frontend Engineers
- Game Developers
- Product Engineering Teams

---

## Platform & Resolution

- **Layout:** Portrait, mobile-first
- **Canvas width:** max 500px, responsive height
- **Target FPS:** 60
- **Controls:** Touch drag (mobile) + WASD / Arrow Keys (desktop)

---

## Core Gameplay Loop

```
Home Screen → Countdown → Gameplay → Game Over → Home Screen
```

Player moves ship → collects minerals → avoids asteroids → builds combos → activates power-ups → survives longer → difficulty scales up → health reaches 0 → Game Over

---

## Game Screens

### Home Screen
- Animated starfield + parallax drifting asteroids + nebula glow
- Game logo (SPACE MINER) with animated pulsing glow
- Buttons: PLAY, HOW TO PLAY, ABOUT
- Stats row (shown after first game): Best Score · Best Combo · Games Played
- Mute/unmute button (top-right, persistent via localStorage)
- Version label
- Menu background music (loops)

### Gameplay Screen
- HUD (single horizontal line): Health bar (%) · Score · Level · Pause button
- 3-2-1 countdown before gameplay begins
- Parallax starfield (3 layers)
- Vignette overlay when health < 30%
- Pause screen: Resume / Restart / Main Menu
- Game background music (loops, starts at 14s to skip intro)

### Game Over Screen
- Final score + NEW BEST badge (if applicable)
- Best combo achieved
- Time survived
- Play Again / Main Menu buttons
- Confetti burst on new high score

---

## Health System

| Property | Value |
|---|---|
| Starting health | 100% |
| Display | Health bar with live % label |
| Bar color | Green → Yellow → Red (based on HP) |

### Damage per asteroid type

| Type | Damage |
|---|---|
| Small | 12 HP |
| Medium | 22 HP |
| Large | 38 HP |

- Shield power-up blocks all damage
- After a hit, player has brief invincibility window (blinking ship)
- Vignette effect activates at < 30% health

---

## Asteroid System

Three asteroid types spawn with weighted probability:

| Type | Probability | Radius | Speed Multiplier | Color |
|---|---|---|---|---|
| Small | 30% | 8–15px | 1.9× | Reddish |
| Medium | 50% | 18–36px | 1.0× | Brown |
| Large | 20% | 42–62px | 0.6× | Grey-blue |

- Spawn from top, left, and right edges (never from bottom)
- Speed scales with level (`1 + level × 0.12`)
- Spawn rate decreases with level (more frequent)
- Count per spawn increases every 3 levels

---

## Mining / Resource System

Resources fall from the top of the screen.

| Type | Rarity | Points | Color |
|---|---|---|---|
| Iron | Common | 10 | Grey |
| Silver | Uncommon | 25 | Silver |
| Gold | Rare | 50 | Gold |
| Diamond | Very Rare | 100 | Cyan |

- Resources fall at 2.8–4.5 px/frame
- Magnet power-up pulls nearby resources toward the player
- Collecting resources builds the combo multiplier

---

## Combo System

- Collecting resources consecutively increases combo multiplier (x1 → x2 → x3 … x5 max)
- Combo resets on asteroid hit
- Combo bar displayed in HUD
- Best combo tracked per session and saved to localStorage

---

## Scoring System

```
Score += resource.points × combo_multiplier
```

- Score milestones trigger banner celebrations (every 500 points)
- Floating score text appears on collection
- High score saved to localStorage via SaveManager

---

## Difficulty Scaling

Every level-up:
- Asteroid speed multiplier increases (`+0.12 per level`)
- Spawn interval decreases (min 500ms)
- Asteroids per spawn increases (every 3 levels)
- Level-up banner displayed with flash effect

---

## Power-Up System

One power-up active at a time. Spawns after a set interval.

| Power-Up | Duration | Effect |
|---|---|---|
| Shield | 9s | Blocks all asteroid damage; cyan ring visual |
| Magnet | 8s | Pulls all nearby resources within 220px |
| Speed Boost | 6s | Increases ship movement speed; trail particles |

- Power-up expiry bar flashes red/orange when < 25% time remains
- Shield absorb shows "BLOCKED!" text + burst effect + mini screen shake
- Power-ups fall at 2.2–3.4 px/frame

---

## Visual Effects

| Effect | Trigger |
|---|---|
| Particle burst | Resource collected |
| Particle ring | Power-up collected |
| Speed trail | Speed boost active |
| Magnet lines | Magnet active (pink lines to nearby resources) |
| Hit flash | Red screen flash on asteroid hit |
| Screen shake | Asteroid collision |
| Vignette | Health < 30% |
| Confetti | New high score on game over |
| Shield absorb ring | Asteroid blocked by shield |
| Floating score text | Resource collected |
| Level-up banner | Level increase |
| Countdown | Game start (3-2-1-GO) |

---

## Audio System

### Background Music
| Screen | Track | Artist | License |
|---|---|---|---|
| Home / Menus | Infinite Perspective | Kevin MacLeod | CC BY 4.0 |
| Gameplay | Odyssey | Kevin MacLeod | CC BY 4.0 |

- Music auto-starts; falls back to first user gesture if browser blocks autoplay
- Smooth fade-out on screen transitions

### Sound Effects (Procedural — Web Audio API)
| Event | Sound |
|---|---|
| Asteroid hit | Low thud + crunch |
| Resource collect | Pitch-based tone (iron → diamond) |
| Combo increase | Rising tone |
| Power-up collect | Ascending arpeggio |
| Game over | Descending drone |
| UI click | Short ping |

### Mute
- Mute button top-right on Home and Game screens
- State persisted in localStorage (`spaceminer_muted`)

---

## Save System

Saved to localStorage key: `spaceminer_save`

| Field | Description |
|---|---|
| `highScore` | All-time best score |
| `bestCombo` | All-time best combo |
| `totalGames` | Total games played |

---

## Architecture

```
scripts/
├── main.js                  # Stage init, screen transitions, game loop
├── constants.js             # Global constants (C.*)
├── entities/
│   ├── Player.js            # Ship movement, health, shield, exhaust
│   ├── Asteroid.js          # 3 types, procedural shape, velocity
│   ├── Resource.js          # 4 types, bobbing motion, magnet logic
│   └── PowerUp.js           # 3 types, drawn icons, pulse tween
├── managers/
│   ├── AudioManager.js      # Web Audio SFX + HTML5 background music
│   ├── AsteroidManager.js   # Spawn, update, collision detection
│   ├── ResourceManager.js   # Spawn, update, magnet, collection
│   ├── PowerUpManager.js    # Spawn, activation, expiry
│   └── SaveManager.js       # localStorage read/write
├── effects/
│   └── ParticleSystem.js    # Burst, ring, trail particle methods
└── ui/
    ├── HomeScreen.js        # Home screen, overlays (HOW TO PLAY, ABOUT)
    └── GameScreen.js        # HUD, game loop, all gameplay screens
```

---

## Folder Structure

```
SPACE MINER/
├── index.html
├── PRD.MD
├── README.md
├── assets/
│   └── audio/
│       ├── menu_music.mp3   # Infinite Perspective — Kevin MacLeod
│       └── game_music.mp3   # Odyssey — Kevin MacLeod
└── scripts/
    ├── main.js
    ├── constants.js
    ├── entities/
    ├── managers/
    ├── effects/
    └── ui/
```

---

## Technical Stack

| Layer | Technology |
|---|---|
| Rendering | EaselJS (CreateJS) — Canvas 2D |
| Animation | TweenJS (CreateJS) |
| Audio SFX | Web Audio API (procedural) |
| Background Music | HTML5 Audio (MP3) |
| Game Loop | createjs.Ticker @ 60 FPS |
| Persistence | localStorage |
| Language | Vanilla JavaScript (ES6+) |
| Layout | HTML/CSS — portrait, max-width 500px |

---

## Portfolio Value

**Resume Description:**

> Built Space Miner, a CreateJS arcade game featuring a health-based damage system, 3 asteroid types, 4 resource types, 3 power-ups, procedural Web Audio SFX, particle effects, screen shake, combo multipliers, difficulty scaling, and persistent high scores — demonstrating modular game architecture, collision systems, and performance-focused canvas rendering.

---

## Success Criteria

- Runs at 60 FPS on modern mobile and desktop browsers
- No noticeable memory leaks during extended play
- Responsive across portrait mobile and desktop
- All audio works with proper autoplay fallback
- Polished UI/UX suitable for portfolio showcase
