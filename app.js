const flipButton = document.getElementById('flip-button');
const optionContainer = document.querySelector('.option-container');
const gameBoardContainer = document.getElementById('game-board-container');
const startButton = document.getElementById('start-button');
const infoDisplay = document.getElementById('info');
const turnDisplay = document.getElementById('turn-display');

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

createBoard('blue', 'player');
createBoard('blue', 'computer');

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
let notDropped;

function getValidity(allBoardBlocks, isHorizontal, startIndex, ship) {
  let validStartIndex = isHorizontal
    ? startIndex <= width * width - ship.length
      ? startIndex
      : width * width - ship.length
    : //handle vertical
    startIndex <= width * width - width * ship.length
    ? startIndex
    : startIndex - ship.length * width + width;

  let shipBlocks = [];

  for (let i = 0; i < ship.length; i++) {
    if (isHorizontal) {
      shipBlocks.push(allBoardBlocks[Number(validStartIndex) + i]);
    } else {
      shipBlocks.push(allBoardBlocks[Number(validStartIndex) + i * width]);
    }
  }

  let valid;

  if (isHorizontal) {
    shipBlocks.every(
      (_shipBlock, index) =>
        (valid =
          shipBlocks[0].id % width !==
          width - (shipBlocks.length - (index + 1)))
    );
  } else {
    shipBlocks.every(
      (_shipBlock, index) =>
        (valid = shipBlocks[0].id < 90 + (width * index + 1))
    );
  }

  const notTakenSpace = shipBlocks.every(
    (shipBlock) => !shipBlock.classList.contains('taken')
  );
  return { shipBlocks, valid, notTakenSpace };
}

function addShipPiece(user, ship, startId) {
  const allBoardBlocks = document.querySelectorAll(`#${user} div`);
  let randomBoolean = Math.random() < 0.5;
  let isHorizontal = user === 'player' ? angle === 0 : randomBoolean;
  let randomStartIndex = Math.floor(Math.random() * width * width); //to get a start point between 0 and 99.
  // console.log('randomStartIndex', randomStartIndex, ship);

  let startIndex = startId ? startId : randomStartIndex;

  const { shipBlocks, valid, notTakenSpace } = getValidity(
    allBoardBlocks,
    isHorizontal,
    startIndex,
    ship
  );

  if (valid && notTakenSpace) {
    // console.log(shipBlocks);
    // adding ship to the board
    shipBlocks.forEach((shipBlock) => {
      shipBlock.classList.add(ship.name);
      shipBlock.classList.add('taken'); //to know if the space was taken.
    });
  } else {
    if (user === 'computer') addShipPiece(user, ship, startId);
    if (user === 'player') notDropped = true;
  }
}
// adding all computer ships to the board
ships.forEach((ship) => addShipPiece('computer', ship));

// Dragging player ships

let draggedShip;

function dragStart(e) {
  notDropped = false;
  draggedShip = e.target;
}

function dragOver(e) {
  e.preventDefault();
  const ship = ships[draggedShip.id];
  highlightArea(e.target.id, ship);
}

function dropShip(e) {
  const startId = e.target.id;
  const ship = ships[draggedShip.id];
  addShipPiece('player', ship, startId);
  if (!notDropped) {
    draggedShip.remove();
  }
}

const allPlayerBlocks = document.querySelectorAll('#player div');
allPlayerBlocks.forEach((playerBlock) => {
  playerBlock.addEventListener('dragover', dragOver);
  playerBlock.addEventListener('drop', dropShip);
});

const optionShips = Array.from(optionContainer.children);
optionShips.forEach((optionShip) =>
  optionShip.addEventListener('dragstart', dragStart)
);

// add highlight

function highlightArea(startIndex, ship) {
  const allBoardBlocks = document.querySelectorAll('#player div');
  let isHorizontal = angle === 0;

  const { shipBlocks, valid, notTakenSpace } = getValidity(
    allBoardBlocks,
    isHorizontal,
    startIndex,
    ship
  );

  if (valid && notTakenSpace) {
    shipBlocks.forEach((shipBlock) => {
      shipBlock.classList.add('hover');
      setTimeout(() => shipBlock.classList.remove('hover'), 500);
    });
  }
}

let gameOver = false;
let playerTurn;
let playerHits = [];
let computerHits = [];
let playerSunkShips = [];
let computerSunkShips = [];

function computerGo() {
  if (!gameOver) {
    turnDisplay.textContent = 'Computers Go!';
    infoDisplay.textContent = 'The computer is thinking ...';

    setTimeout(() => {
      let randomGo = Math.floor(Math.random() * width * width);
      const allBoardBlocks = document.querySelectorAll('#player div');

      if (
        allBoardBlocks[randomGo].classList.contains('taken') &&
        allBoardBlocks[randomGo].classList.contains('boom')
      ) {
        computerGo();
        return;
      } else if (
        allBoardBlocks[randomGo].classList.contains('taken') &&
        !allBoardBlocks[randomGo].classList.contains('boom')
      ) {
        allBoardBlocks[randomGo].classList.add('boom');
        infoDisplay.textContent = 'Your ship got hit!';
        let classes = Array.from(allBoardBlocks[randomGo].classList);
        classes = classes.filter((className) => className !== 'block');
        classes = classes.filter((className) => className !== 'boom');
        classes = classes.filter((className) => className !== 'taken');
        computerHits.push(...classes);
        console.log('computerHits', computerHits);
        checkScore('computer', computerHits, computerSunkShips);
      } else {
        infoDisplay.textContent = 'Nothing got hit this time.';
        allBoardBlocks[randomGo].classList.add('empty');
      }
    }, 3000);

    setTimeout(() => {
      playerTurn = true;
      turnDisplay.textContent = 'Your turn.';
      infoDisplay.textContent = 'Please take your go.';
      const allBoardBlocks = document.querySelectorAll('#computer div');
      allBoardBlocks.forEach((block) =>
        block.addEventListener('click', handleClick)
      );
    }, 6000);
  }
}

function handleClick(e) {
  if (!gameOver) {
    if (e.target.classList.contains('taken')) {
      e.target.classList.add('boom');
      infoDisplay.textContent = `You hit a ship!`;
      let classes = Array.from(e.target.classList);
      classes = classes.filter((className) => className !== 'block');
      classes = classes.filter((className) => className !== 'boom');
      classes = classes.filter((className) => className !== 'taken');
      playerHits.push(...classes);
      // console.log('playerHits', playerHits);
      checkScore('player', playerHits, playerSunkShips);
    }
    if (!e.target.classList.contains('taken')) {
      infoDisplay.textContent = 'Aim better next time!';
      e.target.classList.add('empty');
    }
    playerTurn = false;
    const allBoardBlocks = document.querySelectorAll('#computer div');
    allBoardBlocks.forEach((block) => block.replaceWith(block.cloneNode(true))); //to remove all the event listeners.
    setTimeout(computerGo, 3000);
  }
}

function startGame() {
  if (playerTurn === undefined) {
    if (optionContainer.children.length != 0) {
      infoDisplay.textContent = 'Please place all you ships first!';
    } else {
      const allBoardBlocks = document.querySelectorAll('#computer div');
      allBoardBlocks.forEach((block) =>
        block.addEventListener('click', handleClick)
      );
      playerTurn = true;
      infoDisplay.textContent = 'The game has started!';
      turnDisplay.textContent = 'Your turn';
    }
  }
}

function checkScore(user, userHits, userSunkShips) {
  function checkShip(shipName, shipLength) {
    if (
      userHits.filter((storedShipName) => storedShipName === shipName)
        .length === shipLength
    ) {
      if (user === 'player') {
        infoDisplay.textContent = `You sunk the computer's ${shipName}`;
        playerHits = userHits.filter(
          (storedShipName) => storedShipName !== shipName //remove the sunk ship from the array.
        );
      }
      if (user === 'computer') {
        infoDisplay.textContent = `Your ${shipName} got sunk`;
        computerHits = userHits.filter(
          (storedShipName) => storedShipName !== shipName //remove the sunk ship from the array.
        );
      }
      userSunkShips.push(shipName);
    }
  }
  checkShip('destroyer', 2);
  checkShip('submarine', 3);
  checkShip('cruiser', 3);
  checkShip('battleship', 4);
  checkShip('carrier', 5);

  console.log('playerHits', playerHits);
  console.log('playerSunkShips', playerSunkShips);

  if (playerSunkShips.length === 5) {
    infoDisplay.textContent = 'YOU WON THE WAR!';
    gameOver = true;
  }
  if (computerSunkShips.length === 5) {
    infoDisplay.textContent = 'YOU LOST THE WAR!';
    gameOver = true;
  }
}

startButton.addEventListener('click', startGame);
