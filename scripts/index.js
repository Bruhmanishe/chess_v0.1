let game = new Game();

window.onload = () => {
  game.gameScreen.width = window.innerWidth * 0.95;
  game.gameScreen.height = window.innerWidth * 0.95;
  game.gameScreen.canvas.width = game.gameScreen.width;
  game.gameScreen.canvas.height = game.gameScreen.height;

  game.init();
  function animation() {
    game.render();
    requestAnimationFrame(animation);
  }
  animation();
};
