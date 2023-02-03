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

flipButton.addEventListener('click', flip);

// Board game
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

// Ships

class Ship {
  constructor(name, length) {
    this.name = name;
    this.length = length;
  }
}

const destroyer = new Ship('destroyer', 2);
const submarine = new Ship('submarine', 3);
const cruiser = new Ship('cruiser', 3);
const battleship = new Ship('battleship', 4);
const carrier = new Ship('carrier', 5);

const ships = [destroyer, submarine, cruiser, battleship, carrier];

function addShipPiece(ship) {
  const allBoardBlocksComp = document.querySelectorAll('#computer div');
  let randomBoolean = Math.random() < 0.5;
  let isHorizontal = randomBoolean;
  let randomStartIndex = Math.floor(Math.random() * width * width); //to get a start point between 0 and 99.
  console.log('randomStartIndex', randomStartIndex);

  let shipBlocks = [];

  for (let i = 0; i < ship.length; i++) {
    if (isHorizontal) {
      shipBlocks.push(allBoardBlocksComp[Number(randomStartIndex) + i]);
    } else {
      shipBlocks.push(allBoardBlocksComp[Number(randomStartIndex) + i * width]);
    }
  }
  console.log(shipBlocks);
}

addShipPiece(destroyer);
