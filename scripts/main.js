const canvas = document.getElementById('gameCanvas');
const stage = new createjs.Stage(canvas);
stage.enableMouseOver(30);
createjs.Touch.enable(stage, false, true); // maps touch → mouse events for button clicks

let SW, SH;
let currentScreen = null;

function getSize() {
  const container = document.getElementById('game-container');
  return {
    w: container.clientWidth,
    h: container.clientHeight,
  };
}

function resize() {
  const { w, h } = getSize();
  SW = w;
  SH = h;
  canvas.width  = w;
  canvas.height = h;
}

AudioManager.init();
resize();
window.addEventListener('resize', () => {
  resize();
  showHome();
});

createjs.Ticker.framerate = 60;
createjs.Ticker.timingMode = createjs.Ticker.RAF;

function showHome() {
  if (currentScreen && currentScreen.destroy) currentScreen.destroy();
  stage.removeAllChildren();
  currentScreen = new HomeScreen(SW, SH, onPlay);
  stage.addChild(currentScreen);
  AudioManager.startMenuMusic();
}

function showGame() {
  if (currentScreen && currentScreen.destroy) currentScreen.destroy();
  stage.removeAllChildren();
  currentScreen = new GameScreen(SW, SH, onGameOver, showGame);
  stage.addChild(currentScreen);
}

function onPlay() {
  AudioManager.wakeUp();           // must happen inside user-gesture handler
  AudioManager.stopMusic();        // fade out menu music
  const cover = new createjs.Shape();
  cover.graphics.beginFill('#000').drawRect(0, 0, SW, SH);
  cover.alpha = 0;
  stage.addChild(cover);
  createjs.Tween.get(cover)
    .to({ alpha: 1 }, 300 )
    .call(() => {
      showGame();
      AudioManager.startGameMusic();
      stage.removeChild(cover);
    });
}

function onGameOver() {
  AudioManager.stopMusic();
  const cover = new createjs.Shape();
  cover.graphics.beginFill('#000').drawRect(0, 0, SW, SH);
  cover.alpha = 0;
  stage.addChild(cover);
  createjs.Tween.get(cover)
    .to({ alpha: 1 }, 300)
    .call(() => {
      showHome();
      AudioManager.startMenuMusic();
      stage.removeChild(cover);
    });
}

createjs.Ticker.on('tick', (e) => {
  if (currentScreen && currentScreen.tick) currentScreen.tick(e);
  stage.update(e);
});

showHome();
