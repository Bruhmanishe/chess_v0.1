let game = new Game();

window.onload = () => {
  game.gameScreen.width =
    (window.innerWidth > window.innerHeight
      ? window.innerHeight
      : window.innerWidth) * 0.95;
  game.gameScreen.height = game.gameScreen.width;
  game.gameScreen.canvas.width = game.gameScreen.width;
  game.gameScreen.canvas.height = game.gameScreen.width;

  game.init();
  function animation() {
    game.render();
    requestAnimationFrame(animation);
  }
  animation();
};
