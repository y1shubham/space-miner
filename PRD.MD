# Space Miner — Product Requirement Document (PRD)

## Project Name

Space Miner

---

# Project Overview

Space Miner is a single-player arcade-style space exploration game built using CreateJS.

The player controls a mining spaceship navigating through an asteroid field, collecting valuable minerals while avoiding collisions with dangerous obstacles.

The game focuses on smooth gameplay, increasing difficulty, visual effects, and polished user experience.

---

# Project Goals

### Primary Goal

Build a polished frontend game demonstrating:

* CreateJS expertise
* Game loop architecture
* Collision detection
* State management
* Object pooling
* Animation systems
* Performance optimization

### Secondary Goal

Create a portfolio project that showcases advanced JavaScript and frontend engineering skills.

---

# Target Audience

* Recruiters
* Frontend Engineers
* Game Developers
* Product Engineering Teams

---

# Core Gameplay Loop

Player starts game

↓

Move spaceship

↓

Collect minerals

↓

Avoid asteroids

↓

Earn score

↓

Unlock upgrades

↓

Difficulty increases

↓

Game Over

↓

Play Again

---

# Gameplay Features

## Player Spaceship

Player can:

* Move left
* Move right
* Move up
* Move down

Controls:

* Arrow Keys
  OR
* WASD

---

# Mining System

Resources appear randomly.

Types:

### Iron

Common

Points: 10

---

### Silver

Uncommon

Points: 25

---

### Gold

Rare

Points: 50

---

### Diamond

Very Rare

Points: 100

---

# Asteroid System

Asteroids spawn continuously.

Properties:

* Random speed
* Random size
* Random direction

Collision with asteroid:

Health -1

---

# Health System

Player starts with:

3 Lives

When health reaches:

0

↓

Game Over

---

# Scoring System

Points awarded based on:

Resource rarity

Combo multiplier

Survival duration

---

# Combo System

Collect resources consecutively.

Multiplier:

1x

↓

2x

↓

3x

↓

4x

Maximum:

5x

---

# Difficulty Scaling

Every 30 seconds:

Increase asteroid speed

Increase asteroid count

Increase spawn rate

Increase challenge level

---

# Power-Ups

## Shield

Duration:

10 seconds

Effect:

Invulnerability

---

## Magnet

Duration:

8 seconds

Effect:

Resources attract to player

---

## Speed Boost

Duration:

5 seconds

Effect:

Increase movement speed

---

# Visual Effects

## Particle Effects

When:

* Collecting resource
* Destroying asteroid
* Activating power-up

---

## Screen Shake

Trigger:

Asteroid collision

---

## Floating Score Text

Example:

+50

+100

Combo x3

---

# Game Screens

## Home Screen

Contains:

Game Logo

Play Button

Controls Button

About Button

---

## Gameplay Screen

Contains:

Health

Score

Combo

Current Level

Pause Button

---

## Pause Screen

Resume

Restart

Main Menu

---

## Game Over Screen

Final Score

Highest Combo

Time Survived

Play Again

Main Menu

---

# Audio System

## Background Music

Space ambient soundtrack

---

## Sound Effects

Resource collection

Asteroid hit

Power-up pickup

Game Over

Button clicks

---

# Technical Requirements

## Framework

CreateJS

---

## Language

JavaScript

---

## Rendering

Canvas

---

## Resolution

1920x1080

Responsive scaling

---

# Architecture

## Modules

GameManager

Player

AsteroidManager

ResourceManager

PowerUpManager

CollisionManager

ScoreManager

AudioManager

UIManager

ParticleManager

---

# Folder Structure

src/

├── assets/

├── scripts/

│   ├── managers/

│   ├── entities/

│   ├── ui/

│   ├── effects/

│   └── utils/

├── sounds/

├── images/

└── index.html

---

# Portfolio Features

## Dedicated Project Page

Show:

Overview

Screenshots

Architecture Diagram

Game Features

Technical Challenges

Lessons Learned

---

# Resume Description

Built a CreateJS-based arcade space exploration game featuring collision systems, procedural spawning, combo mechanics, particle effects, and difficulty scaling while implementing modular game architecture and performance-focused rendering techniques.

---

# Estimated Development Time

MVP:
3–5 Days

Polished Version:
7–10 Days

Portfolio-Ready Version:
10–14 Days

---

# Success Criteria

Game runs smoothly at 60 FPS.

No noticeable memory leaks.

Responsive across desktop devices.

Polished UI/UX.

Suitable for portfolio showcase and technical discussions during interviews.
