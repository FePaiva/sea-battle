const flipButton = document.getElementById('flip-button');
const optionContainer = document.querySelector('.option-container');
const gameBoardContainer = document.getElementById('game-board-container');

let angle = 0;

function flip() {
  const optionShips = Array.from(optionContainer.children);

  // if (angle === 0) {
  //   angle = 90;
  // } else {
  //   angle = 0;
  // }

  angle = angle === 0 ? 90 : 0;

  optionShips.forEach(
    (optionShip) => (optionShip.style.transform = `rotate(${angle}deg)`)
  );
}

const width = 10;

function createBoard(color, user) {
  const gameBoard = document.createElement('div');
  gameBoard.classList.add('game-board');
  gameBoard.style.backgroundColor = color;
  gameBoard.id = user;

  for (let i = 0; i < width * width; i++) {
    const block = document.createElement('div');
    block.classList.add('block');
    block.id = i;

    gameBoard.append(block);
  }

  gameBoardContainer.append(gameBoard);
}

createBoard('pink', 'player');
createBoard('yellow', 'computer');

flipButton.addEventListener('click', flip);
