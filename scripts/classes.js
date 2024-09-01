class GameScreen {
  constructor(id) {
    this.width = 1080;
    this.height = 1080;
    this.background = document.getElementById("boardImg");
    this.canvas = document.createElement("canvas");
    this.canvasContainer = document.getElementById(id);
    this.canvasContainer.insertAdjacentElement("beforeend", this.canvas);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext("2d");
  }
}
class Game {
  constructor() {
    this.gameScreen = new GameScreen("canvaContainer");
    this.board = [];
    this.mouse = {
      x: 0,
      y: 0,
      isDown: false,
    };
    this.figures = [];
    this.turn = "white";
    this.previousTurns = [];
    this.gameOver = false;
    this.winner;

    this.gameScreen.canvas.addEventListener("mousemove", (e) => {
      this.mouse.x = e.offsetX;
      this.mouse.y = e.offsetY;
      for (let i = 0; this.board.length > i; i++) {
        for (let j = 0; this.board[i].length > j; j++) {
          if (this.board[i][j] == this.findCell(this.mouse.x, this.mouse.y)) {
            this.board[i][j].isInfocus = true;
          } else {
            this.board[i][j].isInfocus = false;
            this.board[i][j].isInfocus = false;
          }
        }
      }
    });
    this.gameScreen.canvas.addEventListener("mousedown", (e) => {
      this.mouse.isDown = true;
      for (let i = 0; this.board.length > i; i++) {
        for (let j = 0; this.board[i].length > j; j++) {
          if (
            this.board[i][j] == this.findCell(this.mouse.x, this.mouse.y) &&
            this.board[i][j].figure &&
            this.board[i][j].figure.side === this.turn
          ) {
            this.figures.forEach((fig) => (fig.isInfocus = false));
            if (this.board[i][j].figure)
              if (!this.board[i][j].figure.isInfocus) {
                this.board[i][j].figure.isInfocus = true;
              } else {
                this.board[i][j].figure.isInfocus = false;
              }
          } else {
          }
        }
      }
    });
    this.gameScreen.canvas.addEventListener("mouseup", (e) => {
      this.mouse.isDown = false;
      console.log("untouch");
    });
    this.gameScreen.canvas.addEventListener("touchstart", () => {
      this.mouse.isDown = true;
    });
    window.addEventListener("keydown", (e) => {
      console.log(e.keyCode);
      if (e.keyCode === 90) {
        console.log(this.previousTurns, this.figures);
        this.board = this.previousTurns[0].board;
        this.figures = this.previousTurns[0].figures;
      }
    });
  }

  init() {
    for (let i = 0; 8 > i; i++) {
      this.board.push([]);
      for (let j = 0; 8 > j; j++) {
        this.board[i].push(new Cell(this));
        this.board[i][j].x =
          this.board[i][j].width * j + this.board[i][j].width / 2;
        this.board[i][j].y =
          this.board[i][j].height * i + this.board[i][j].height / 2;
      }
    }
    this.#createFigures();
    console.log(this.figures);
    this.#saveTurn();
  }
  render() {
    this.gameScreen.ctx.drawImage(
      this.gameScreen.background,
      0,
      0,
      this.gameScreen.width,
      this.gameScreen.height
    );
    this.board.forEach((array) => {
      array.forEach((cell) => {
        if (!this.gameOver) {
          cell.draw(this.gameScreen.ctx);
        }
        if (cell.figure) {
          cell.figure.draw(this.gameScreen.ctx);
        }
      });
    });
    if (!this.gameOver) {
      this.update();
    } else {
      this.drawGameOver(this.gameScreen.ctx);
    }
  }

  update() {
    this.figures.forEach((fig) => {
      if (fig.isInfocus && fig.side === this.turn) {
        for (let i = 0; this.board.length > i; i++) {
          for (let j = 0; this.board[i].length > j; j++) {
            if (
              this.mouse.isDown &&
              this.board[i][j].isInfocus &&
              (this.board[i][j].figure === null ||
                this.board[i][j].figure.side !== fig.side)
            ) {
              if (fig.type === "king") {
                if (
                  i !== 7 &&
                  i !== 0 &&
                  (fig.cell == this.board[i + 1][j] ||
                    fig.cell == this.board[i - 1][j] ||
                    fig.cell == this.board[i][j + 1] ||
                    fig.cell == this.board[i][j - 1] ||
                    fig.cell == this.board[i + 1][j - 1] ||
                    fig.cell == this.board[i - 1][j - 1] ||
                    fig.cell == this.board[i - 1][j + 1] ||
                    fig.cell == this.board[i + 1][j + 1])
                ) {
                  this.#moveFigure(fig, this.board[i][j]);
                } else if (
                  i !== 7 &&
                  (fig.cell == this.board[i + 1][j] ||
                    fig.cell == this.board[i][j + 1] ||
                    fig.cell == this.board[i][j - 1] ||
                    fig.cell == this.board[i + 1][j - 1] ||
                    fig.cell == this.board[i + 1][j + 1])
                ) {
                  this.#moveFigure(fig, this.board[i][j]);
                } else if (
                  i !== 0 &&
                  (fig.cell == this.board[i - 1][j] ||
                    fig.cell == this.board[i][j + 1] ||
                    fig.cell == this.board[i][j - 1] ||
                    fig.cell == this.board[i - 1][j - 1] ||
                    fig.cell == this.board[i - 1][j + 1])
                ) {
                  this.#moveFigure(fig, this.board[i][j]);
                }
              } else if (fig.type === "pawn") {
                let direction = fig.side === "white" ? +1 : -1;
                let problemArea = fig.side === "black" ? [0, 1] : [6, 7];
                if (
                  fig.isFirstM &&
                  i !== problemArea[0] &&
                  i !== problemArea[1]
                ) {
                  if (
                    (fig.cell === this.board[i + direction][j] ||
                      fig.cell === this.board[i + direction * 2][j]) &&
                    this.board[i][j].figure === null
                  ) {
                    this.#moveFigure(fig, this.board[i][j]);

                    fig.isFirstM = false;
                  }
                } else if (
                  i !== problemArea[0] &&
                  i !== problemArea[1] &&
                  fig.cell === this.board[i + direction][j] &&
                  this.board[i][j].figure === null
                ) {
                  this.#moveFigure(fig, this.board[i][j]);
                }
                if (
                  this.board[i][j].figure &&
                  this.board[i][j].figure.side !== fig.side &&
                  (fig.cell === this.board[i + direction][j + 1] ||
                    fig.cell === this.board[i + direction][j - 1])
                ) {
                  this.#moveFigure(fig, this.board[i][j]);
                }
              } else if (fig.type === "knight") {
                const problemArea = [0, 1, 6, 7];
                if (
                  i !== problemArea[0] &&
                  i !== problemArea[1] &&
                  i !== problemArea[2] &&
                  i !== problemArea[3]
                ) {
                  if (
                    this.board[i + 2][j + 1] === fig.cell ||
                    this.board[i - 2][j + 1] === fig.cell ||
                    this.board[i - 1][j + 2] === fig.cell ||
                    this.board[i + 1][j + 2] === fig.cell ||
                    this.board[i + 1][j - 2] === fig.cell ||
                    this.board[i - 1][j - 2] === fig.cell ||
                    this.board[i + 2][j - 1] === fig.cell ||
                    this.board[i - 2][j - 1] === fig.cell
                  ) {
                    this.#moveFigure(fig, this.board[i][j]);
                  }
                } else if (i == problemArea[1]) {
                  if (
                    this.board[i + 2][j + 1] === fig.cell ||
                    this.board[i - 1][j + 2] === fig.cell ||
                    this.board[i + 1][j + 2] === fig.cell ||
                    this.board[i + 1][j - 2] === fig.cell ||
                    this.board[i - 1][j - 2] === fig.cell ||
                    this.board[i + 2][j - 1] === fig.cell
                  ) {
                    this.#moveFigure(fig, this.board[i][j]);
                  }
                } else if (i == problemArea[2]) {
                  if (
                    this.board[i - 2][j + 1] === fig.cell ||
                    this.board[i - 1][j + 2] === fig.cell ||
                    this.board[i + 1][j + 2] === fig.cell ||
                    this.board[i + 1][j - 2] === fig.cell ||
                    this.board[i - 1][j - 2] === fig.cell ||
                    this.board[i - 2][j - 1] === fig.cell
                  ) {
                    this.#moveFigure(fig, this.board[i][j]);
                  }
                } else if (i == problemArea[0]) {
                  if (
                    this.board[i + 2][j + 1] === fig.cell ||
                    this.board[i + 1][j + 2] === fig.cell ||
                    this.board[i + 1][j - 2] === fig.cell ||
                    this.board[i + 2][j - 1] === fig.cell
                  ) {
                    this.#moveFigure(fig, this.board[i][j]);
                  }
                } else if (i == problemArea[3]) {
                  if (
                    this.board[i - 2][j + 1] === fig.cell ||
                    this.board[i - 1][j + 2] === fig.cell ||
                    this.board[i - 1][j - 2] === fig.cell ||
                    this.board[i - 2][j - 1] === fig.cell
                  ) {
                    this.#moveFigure(fig, this.board[i][j]);
                  }
                }
              } else if (fig.type === "rook") {
                for (let a = 0; this.board.length > a; a++) {
                  for (let b = 0; this.board.length > b; b++) {
                    if (this.board[a][b] === fig.cell && (i === a || j === b)) {
                      if (i === a) {
                        const finishPoint = j > b ? j - 1 : b;
                        let startingPont = j < b ? j + 1 : b;
                        let allowMove = false;
                        if (finishPoint - startingPont !== 0) {
                          for (
                            startingPont;
                            finishPoint > startingPont;
                            startingPont++
                          ) {
                            if (
                              this.board[i][startingPont].figure == null ||
                              this.board[i][startingPont].figure == fig
                            ) {
                              allowMove = true;
                            } else {
                              return;
                            }
                          }
                        } else {
                          this.#moveFigure(fig, this.board[i][j]);
                          return;
                        }
                        if (allowMove) {
                          this.#moveFigure(fig, this.board[i][j]);
                          return;
                        }
                      } else if (j === b) {
                        const finishPoint = i > a ? i - 1 : a;
                        let startingPont = i < a ? i + 1 : a;
                        let allowMove = false;
                        if (finishPoint - startingPont !== 0) {
                          for (
                            startingPont;
                            finishPoint > startingPont;
                            startingPont++
                          ) {
                            if (
                              this.board[startingPont][j].figure == null ||
                              this.board[startingPont][j].figure == fig
                            ) {
                              allowMove = true;
                              console.log("yeee");
                            } else {
                              console.log(
                                finishPoint,
                                startingPont,
                                this.board[i][startingPont].figure
                              );
                              return;
                            }
                          }
                        } else {
                          this.#moveFigure(fig, this.board[i][j]);
                          return;
                        }
                        if (allowMove) {
                          this.#moveFigure(fig, this.board[i][j]);
                          return;
                        }
                      }
                    }
                  }
                }
              } else if (fig.type === "bishop") {
                for (let a = 0; this.board.length > a; a++) {
                  for (let b = 0; this.board[i].length > b; b++) {
                    if (this.board[a][b] === fig.cell) {
                      if (i !== a && b !== j) {
                        let startingX = b;
                        let finishX = j;
                        let startingY = a;
                        let finishY = i;
                        let isAbleMove = false;

                        if (
                          Math.abs(finishX - startingX) ===
                          Math.abs(finishY - startingY)
                        ) {
                          if (
                            Math.abs(finishX - startingX) !== 1 &&
                            Math.abs(finishY - startingY) !== 1
                          ) {
                            if (finishX > startingX && finishY > startingY) {
                              for (
                                startingX;
                                finishX > startingX;
                                startingX++
                              ) {
                                startingY++;
                                startingX++;
                                if (
                                  this.board[startingY][startingX].figure ==
                                    null ||
                                  this.board[startingY][startingX].figure == fig
                                ) {
                                  isAbleMove = true;
                                } else {
                                  isAbleMove = false;
                                  return;
                                }
                              }
                            } else if (
                              finishX < startingX &&
                              finishY < startingY
                            ) {
                              for (
                                startingX;
                                finishX < startingX;
                                startingX--
                              ) {
                                startingY--;
                                startingX--;
                                if (
                                  this.board[startingY][startingX].figure ==
                                    null ||
                                  this.board[startingY][startingX].figure == fig
                                ) {
                                  isAbleMove = true;
                                } else {
                                  isAbleMove = false;
                                  return;
                                }
                              }
                            } else if (
                              finishX > startingX &&
                              finishY < startingY
                            ) {
                              for (
                                startingX;
                                finishX > startingX;
                                startingX++
                              ) {
                                startingY--;
                                startingX++;
                                if (
                                  this.board[startingY][startingX].figure ==
                                    null ||
                                  this.board[startingY][startingX].figure == fig
                                ) {
                                  isAbleMove = true;
                                } else {
                                  isAbleMove = false;
                                  return;
                                }
                              }
                            } else if (
                              finishX < startingX &&
                              finishY > startingY
                            ) {
                              for (
                                startingX;
                                finishX < startingX;
                                startingX--
                              ) {
                                startingY++;
                                startingX--;
                                if (
                                  this.board[startingY][startingX].figure ==
                                    null ||
                                  this.board[startingY][startingX].figure == fig
                                ) {
                                  isAbleMove = true;
                                } else {
                                  isAbleMove = false;
                                  return;
                                }
                              }
                            }
                            if (isAbleMove) {
                              this.#moveFigure(fig, this.board[i][j]);
                              return;
                            }
                          } else {
                            this.#moveFigure(fig, this.board[i][j]);
                            return;
                          }
                        }
                      }
                    }
                  }
                }
              } else if (fig.type === "queen") {
                for (let a = 0; this.board.length > a; a++) {
                  for (let b = 0; this.board.length > b; b++) {
                    if (this.board[a][b] === fig.cell && (i === a || j === b)) {
                      if (i === a) {
                        const finishPoint = j > b ? j - 1 : b;
                        let startingPont = j < b ? j + 1 : b;
                        let allowMove = false;
                        if (finishPoint - startingPont !== 0) {
                          for (
                            startingPont;
                            finishPoint > startingPont;
                            startingPont++
                          ) {
                            if (
                              this.board[i][startingPont].figure == null ||
                              this.board[i][startingPont].figure == fig
                            ) {
                              allowMove = true;
                            } else {
                              return;
                            }
                          }
                        } else {
                          this.#moveFigure(fig, this.board[i][j]);
                          return;
                        }
                        if (allowMove) {
                          this.#moveFigure(fig, this.board[i][j]);
                          return;
                        }
                      } else if (j === b) {
                        const finishPoint = i > a ? i - 1 : a;
                        let startingPont = i < a ? i + 1 : a;
                        let allowMove = false;
                        if (finishPoint - startingPont !== 0) {
                          for (
                            startingPont;
                            finishPoint > startingPont;
                            startingPont++
                          ) {
                            if (
                              this.board[startingPont][j].figure == null ||
                              this.board[startingPont][j].figure == fig
                            ) {
                              allowMove = true;
                              console.log("yeee");
                            } else {
                              console.log(
                                finishPoint,
                                startingPont,
                                this.board[i][startingPont].figure
                              );
                              return;
                            }
                          }
                        } else {
                          this.#moveFigure(fig, this.board[i][j]);
                          return;
                        }
                        if (allowMove) {
                          this.#moveFigure(fig, this.board[i][j]);
                          return;
                        }
                      }
                    } else if (
                      i !== a &&
                      b !== j &&
                      this.board[a][b] === fig.cell
                    ) {
                      let startingX = b;
                      let finishX = j;
                      let startingY = a;
                      let finishY = i;
                      let isAbleMove = false;

                      if (
                        Math.abs(finishX - startingX) ===
                        Math.abs(finishY - startingY)
                      ) {
                        if (
                          Math.abs(finishX - startingX) !== 1 &&
                          Math.abs(finishY - startingY) !== 1
                        ) {
                          if (finishX > startingX && finishY > startingY) {
                            for (startingX; finishX > startingX; startingX++) {
                              startingY++;
                              startingX++;
                              if (
                                this.board[startingY][startingX].figure ==
                                  null ||
                                this.board[startingY][startingX].figure == fig
                              ) {
                                isAbleMove = true;
                              } else {
                                isAbleMove = false;
                                return;
                              }
                            }
                          } else if (
                            finishX < startingX &&
                            finishY < startingY
                          ) {
                            for (startingX; finishX < startingX; startingX--) {
                              startingY--;
                              startingX--;
                              if (
                                this.board[startingY][startingX].figure ==
                                  null ||
                                this.board[startingY][startingX].figure == fig
                              ) {
                                isAbleMove = true;
                              } else {
                                isAbleMove = false;
                                return;
                              }
                            }
                          } else if (
                            finishX > startingX &&
                            finishY < startingY
                          ) {
                            for (startingX; finishX > startingX; startingX++) {
                              startingY--;
                              startingX++;
                              if (
                                this.board[startingY][startingX].figure ==
                                  null ||
                                this.board[startingY][startingX].figure == fig
                              ) {
                                isAbleMove = true;
                              } else {
                                isAbleMove = false;
                                return;
                              }
                            }
                          } else if (
                            finishX < startingX &&
                            finishY > startingY
                          ) {
                            for (startingX; finishX < startingX; startingX--) {
                              startingY++;
                              startingX--;
                              if (
                                this.board[startingY][startingX].figure ==
                                  null ||
                                this.board[startingY][startingX].figure == fig
                              ) {
                                isAbleMove = true;
                              } else {
                                isAbleMove = false;
                                return;
                              }
                            }
                          }
                          if (isAbleMove) {
                            this.#moveFigure(fig, this.board[i][j]);
                            return;
                          }
                        } else {
                          this.#moveFigure(fig, this.board[i][j]);
                          return;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    this.figures.forEach((fig) => fig.update());
    if (this.turn === "black") {
      this.gameScreen.canvas.parentElement.style.transform = "rotate(180deg)";
    } else {
      this.gameScreen.canvas.parentElement.style.transform = "";
    }
  }

  findCell(x, y) {
    for (let i = 0; this.board.length > i; i++) {
      for (let j = 0; this.board[i].length > j; j++) {
        if (
          x >= this.board[i][j].width * j &&
          x < this.board[i][j].width * (j + 1)
        ) {
          if (
            y >= this.board[i][j].height * i &&
            y < this.board[i][j].height * (i + 1)
          ) {
            return this.board[i][j];
          }
        }
      }
    }
  }

  #nextTurn() {
    this.turn === "white" ? (this.turn = "black") : (this.turn = "white");
    this.#saveTurn();
  }

  #moveFigure(fig, cell) {
    fig.cell.figure = null;
    if (cell.fig !== null) {
      this.figures.forEach((figure, id) => {
        cell.figure === figure
          ? figure.type === "king"
            ? ((this.gameOver = true),
              (this.winner = figure.side === "white" ? "black" : "white"))
            : null
          : null;
        cell.figure === figure ? this.figures.splice(id, 1) : null;
      });
    }

    cell.figure = fig;
    fig.cell = cell;
    fig.isInfocus = false;
    this.#nextTurn();
    console.log(this.figures);
  }

  #saveTurn() {
    let previousBoard = [];
    let previousFigures = [];
    this.previousTurns.push({
      board: previousBoard,
      figures: previousFigures,
    });
  }

  #createFigures() {
    this.board[0][3].figure = new King(this, this.board[0][3]);
    this.board[0][3].figure.side = "black";

    this.board[7][3].figure = new King(this, this.board[7][3]);
    for (let i = 0; 16 > i; i++) {
      if (i < 8) {
        this.board[6][i].figure = new Pawn(this, this.board[6][i]);
        this.board[6][i].figure.side = "white";
      } else {
        this.board[1][i - 8].figure = new Pawn(this, this.board[1][i - 8]);
        this.board[1][i - 8].figure.side = "black";
      }
    }

    this.board[0][1].figure = new Knight(this, this.board[0][1]);
    this.board[0][1].figure.side = "black";
    this.board[0][6].figure = new Knight(this, this.board[0][6]);
    this.board[0][6].figure.side = "black";
    this.board[7][1].figure = new Knight(this, this.board[7][1]);
    this.board[7][6].figure = new Knight(this, this.board[7][6]);

    this.board[7][7].figure = new Rook(this, this.board[7][7]);
    this.board[7][0].figure = new Rook(this, this.board[7][0]);

    this.board[0][0].figure = new Rook(this, this.board[0][0]);
    this.board[0][0].figure.side = "black";
    this.board[0][7].figure = new Rook(this, this.board[0][7]);
    this.board[0][7].figure.side = "black";

    this.board[7][2].figure = new Bishop(this, this.board[7][2]);
    this.board[7][5].figure = new Bishop(this, this.board[7][5]);

    this.board[0][2].figure = new Bishop(this, this.board[0][2]);
    this.board[0][2].figure.side = "black";
    this.board[0][5].figure = new Bishop(this, this.board[0][5]);
    this.board[0][5].figure.side = "black";

    this.board[7][4].figure = new Queen(this, this.board[7][4]);

    this.board[0][4].figure = new Queen(this, this.board[0][4]);
    this.board[0][4].figure.side = "black";
  }

  drawGameOver(ctx) {
    ctx.save();
    if (this.winner === "white") {
    }
    ctx.fillStyle = this.winner;
    ctx.globalAlpha = 0.4;
    ctx.rect(0, 0, this.gameScreen.width, this.gameScreen.height);
    ctx.fill();
    ctx.fillStyle = this.winner === "white" ? "black" : "white";
    ctx.globalAlpha = 1;
    this.winner === "white" ? ctx.rotate(Math.PI) : null;
    ctx.textAlign = "center";
    ctx.font = `bold ${this.gameScreen.width / 20}px verdana, sans-serif`;
    ctx.fillText(
      "Player of " + this.winner + " has won!",
      this.winner === "white"
        ? -this.gameScreen.width / 2
        : this.gameScreen.width / 2,
      this.winner === "white"
        ? -this.gameScreen.height / 2
        : this.gameScreen.height / 2
    );

    ctx.restore();
  }
}

class Cell {
  constructor(game) {
    this.game = game;
    this.width = this.game.gameScreen.width / 8;
    this.height = this.game.gameScreen.height / 8;
    this.x;
    this.y;
    this.figure = null;
    this.isInfocus = false;
    this.focus = 0;
  }
  draw(ctx) {
    if (this.isInfocus) {
      ctx.save();
      ctx.strokeStyle =
        this.figure === null
          ? "white"
          : this.game.turn !== this.figure.side
          ? "red"
          : "yellow";
      ctx.lineWidth = this.focus;
      ctx.beginPath();
      ctx.moveTo(this.x - this.width * 0.5, this.y - this.width * 0.5);
      ctx.lineTo(this.x + this.width * 0.5, this.y - this.width * 0.5);
      ctx.lineTo(this.x + this.width * 0.5, this.y + this.width * 0.5);
      ctx.lineTo(this.x - this.width * 0.5, this.y + this.width * 0.5);
      ctx.lineTo(this.x - this.width * 0.5, this.y - this.width * 0.5);

      ctx.stroke();

      ctx.restore();
      this.focus <= 10 ? (this.focus += 0.35) : (this.focus = this.focus);
    } else {
      this.focus = 0;
    }
  }
}

class Figure {
  constructor(game, cell) {
    this.game = game;
    this.cell = cell;
    this.side = "white";
    this.img = document.getElementById("figure");
    this.width = this.game.gameScreen.width / 8;
    this.height = this.game.gameScreen.height / 8;
    this.x = this.cell.x;
    this.y = this.cell.y;
    this.isInfocus = false;
    this.game.figures.push(this);
  }
  draw(ctx) {
    if (this.isInfocus) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = "blue";
      ctx.rect(
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height
      );
      ctx.fill();
      ctx.restore();
    }
    ctx.save();
    if (this.game.turn === "black") {
      ctx.rotate(Math.PI);
      ctx.drawImage(
        this.img,
        -this.x - this.width / 2,
        -this.y - this.height / 2,
        this.width,
        this.height
      );
    } else {
      ctx.drawImage(
        this.img,
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height
      );
    }

    ctx.restore();
  }
  update() {
    this.x = this.cell.x;
    this.y = this.cell.y;
  }
}

class King extends Figure {
  constructor(game, cell) {
    super(game, cell);
    this.type = "king";
  }
  update() {
    this.x = this.cell.x;
    this.y = this.cell.y;
    this.img =
      this.side !== "white"
        ? document.getElementById("kingBlack")
        : document.getElementById("kingWhite");
  }
}

class Pawn extends Figure {
  constructor(game, cell) {
    super(game, cell);
    this.type = "pawn";
    this.isFirstM = true;
    this.img =
      this.side !== "white"
        ? document.getElementById("pawnWhite")
        : document.getElementById("pawnBlack");
  }
  update() {
    this.x = this.cell.x;
    this.y = this.cell.y;
    this.img =
      this.side !== "white"
        ? document.getElementById("pawnBlack")
        : document.getElementById("pawnWhite");
  }
}

class Knight extends Figure {
  constructor(game, cell) {
    super(game, cell);
    this.type = "knight";
  }
  update() {
    this.x = this.cell.x;
    this.y = this.cell.y;
    this.img =
      this.side !== "white"
        ? document.getElementById("knightBlack")
        : document.getElementById("knightWhite");
  }
}

class Rook extends Figure {
  constructor(game, cell) {
    super(game, cell);
    this.type = "rook";
  }
  update() {
    this.x = this.cell.x;
    this.y = this.cell.y;
    this.img =
      this.side !== "white"
        ? document.getElementById("rookBlack")
        : document.getElementById("rookWhite");
  }
}

class Bishop extends Figure {
  constructor(game, cell) {
    super(game, cell);
    this.type = "bishop";
  }
  update() {
    this.x = this.cell.x;
    this.y = this.cell.y;
    this.img =
      this.side !== "white"
        ? document.getElementById("bishopBlack")
        : document.getElementById("bishopWhite");
  }
}

class Queen extends Figure {
  constructor(game, cell) {
    super(game, cell);
    this.type = "queen";
  }
  update() {
    this.x = this.cell.x;
    this.y = this.cell.y;
    this.img =
      this.side !== "white"
        ? document.getElementById("queenBlack")
        : document.getElementById("queenWhite");
  }
}
