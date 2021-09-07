import { LEVEL, OBJECT_TYPE } from "./src/setup.js";
import { randomMovement } from "./src/ghostMoves.js";

import GameBoard from './src/GameBoard.js';
import Pacman from "./src/Pacman.js";
import Ghost from "./src/Ghost.js";

// DOM Elements
const gameGrid = document.getElementById('game');
const scoreTable = document.getElementById('score');
const startButton = document.getElementById('start');

// Sounds
const soundDot = './assets/sounds/munch.wav';
const soundPill = './assets/sounds/pill.wav';
const soundGameStart = './assets/sounds/game_start.wav';
const soundGameOver = './assets/sounds/death.wav';
const soundGhost = './assets/sounds/eat_ghost.wav';

// Game Constants
const POWER_PILL_TIME = 10000;
const GLOBAL_SPEED = 70;
const gameBoard = GameBoard.createGameBoard(gameGrid, LEVEL);

// Initial Setup
let score = 0;
let timer = null;
let gameWin = false;
let powerPillActive = false;
let powerPillTimer = null;

const playAudio = (sound) => {
    const soundEffect = new Audio(sound);
    soundEffect.play();
}

const gameOver = (pacman) => {
    playAudio(soundGameOver);
    
    document.removeEventListener('keydown', e => pacman.handleKeyInput(e, gameBoard.objectExist));
    gameBoard.showGameStatus(gameWin);

    clearInterval(timer);
    startButton.classList.remove('hide');
}

const checkCollisions = (pacman, ghosts) => {
    const collidedGhost = ghosts.find(ghost => pacman.pos === ghost.pos);

    if (collidedGhost) {
        if (pacman.powerPill) {
            playAudio(soundGhost);
            ghosts.forEach((ghost, i) => {
                if (collidedGhost.name === ghost.name) {
                    gameBoard.removeObject(collidedGhost.pos, [
                        OBJECT_TYPE.GHOST,
                        OBJECT_TYPE.SCARED,
                        collidedGhost.name
                    ]);
                    
                    ghost.pos = ghost.startPos;
                    score += 100;
                }
            })
        } else {
            gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PACMAN]);
            gameBoard.rotateDiv(pacman.pos, 0);
            gameOver(pacman. gameGrid);
        }
    }
}

const gameLoop = (pacman, ghosts) => {
    gameBoard.moveCharacter(pacman);
    checkCollisions(pacman, ghosts);

    ghosts.forEach(ghost => gameBoard.moveCharacter(ghost));
    checkCollisions(pacman, ghosts);

    // Check for dot
    if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.DOT)) {
        playAudio(soundDot);
        gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.DOT]);
        gameBoard.dotCount--;
        score += 10;
    }

    // Check for powerpill
    if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.PILL)) {
        playAudio(soundPill);
        gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PILL]);
        
        pacman.powerPill = true;
        score += 50;

        clearTimeout(powerPillTimer);
        powerPillTimer = setTimeout(
            () => (pacman.powerPill = false),
            POWER_PILL_TIME
        );
    }

    // Change ghost scare
    if (pacman.powerPill !== powerPillActive) {
        powerPillActive = pacman.powerPill;
        ghosts.forEach((ghost) => ghost.isScared = pacman.powerPill);
    }

    // Check for all dots 
    if (!gameBoard.dotCount) {
        gameWin = true;
        gameOver(pacman, ghosts);
    }

    // Show Score
    scoreTable.innerHTML = score;
}

const startGame = () => {
    playAudio(soundGameStart);

    gameWin = false;
    powerPillActive = false;
    score = 0;

    startButton.classList.add('hide');

    gameBoard.createGrid(LEVEL);

    const pacman = new Pacman(2, 290);
    gameBoard.addObject(290, [OBJECT_TYPE.PACMAN]);
    document.addEventListener('keydown', (e) => {
        e.preventDefault();
        pacman.handleKeyInput(e, gameBoard.objectExist);
        }   
    );

    const ghosts = [
        new Ghost(5, 188, randomMovement, OBJECT_TYPE.BLINKY),
        new Ghost(4, 209, randomMovement, OBJECT_TYPE.PINKY),
        new Ghost(3, 230, randomMovement, OBJECT_TYPE.INKY),
        new Ghost(2, 251, randomMovement, OBJECT_TYPE.CLYDE)
    ]

    timer = setInterval(() => gameLoop(pacman, ghosts), GLOBAL_SPEED);
}

// Initialize game
startButton.addEventListener('click', startGame);