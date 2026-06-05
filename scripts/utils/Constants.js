const C = {
  MAX_WIDTH: 500,

  PLAYER_SPEED: 5,
  PLAYER_SPEED_BOOST: 9,
  PLAYER_RADIUS: 22,
  INVINCIBLE_DURATION: 2000,
  LIVES: 3,

  ASTEROID_BASE_SPEED: 3.5,
  ASTEROID_SPAWN_INTERVAL: 1200,
  ASTEROID_BASE_COUNT: 6,

  RESOURCE_SPAWN_INTERVAL: 1800,
  RESOURCE_TYPES: [
    { name: 'iron',    points: 10,  color: '#b0b0b0', radius: 10, weight: 60 },
    { name: 'silver',  points: 25,  color: '#c0d8ff', radius: 11, weight: 25 },
    { name: 'gold',    points: 50,  color: '#ffd700', radius: 12, weight: 12 },
    { name: 'diamond', points: 100, color: '#a8f0ff', radius: 13, weight: 3  },
  ],

  POWERUP_SPAWN_INTERVAL: 12000,

  COMBO_MAX: 5,
  COMBO_RESET_TIME: 3000,

  DIFFICULTY_INTERVAL: 10000,
  FPS: 60,
};
