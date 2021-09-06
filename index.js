import { LEVEL, OBJECT_TYPE } from "./src/setup.js";

import GameBoard from './src/GameBoard.js';

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
    
}

const startGame = () => {
    
}