import { LEVEL, OBJECT_TYPE } from "./src/setup.js";

import GameBoard from './src/GameBoard.js';
import Pacman from "./src/Pacman.js";

// DOM Elements
const gameGrid = document.getElementById('game');
const scoreTable = document.getElementById('score');
const startButton = document.getElementById('start');

// Game Constants
const POWER_PILL_TIME = 10000;
const GLOBAL_SPEED = 80;
const gameBoard = GameBoard.createGameBoard(gameGrid, LEVEL);

// Initial Setup
let score = 0;
let timer = null;
let gameWin = false;
let powerPillActive = false;
let powerPillTimer = null;

const gameOver = (pacman, grid) => {

}

const checkCollisions = (pacman, ghosts) => {
    
}

const gameLoop = (pacman, ghosts) => {
    gameBoard.moveCharacter(pacman);
}

const startGame = () => {
    gameWin = false;
    powerPillActive = false;
    score = 0;

    startButton.classList.add('hide');

    gameBoard.createGrid(LEVEL);

    const pacman = new Pacman(2, 290);
    gameBoard.addObject(290, [OBJECT_TYPE.PACMAN]);
    document.addEventListener('keydown', (e) => 
        pacman.handleKeyInput(e, gameBoard.objectExist)
    );

    timer = setInterval(() => gameLoop(pacman), GLOBAL_SPEED);
}

// Initialize game
startButton.addEventListener('click', startGame);