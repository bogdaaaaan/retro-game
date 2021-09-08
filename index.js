import { LEVEL, OBJECT_TYPE, ROUND_END_TIME } from './src/setup.js';
import { randomMovement } from './src/ghostMoves.js';

import GameBoard from './src/GameBoard.js';
import Pacman from './src/Pacman.js';
import Ghost from './src/Ghost.js';

// DOM Elements
const gameGrid = document.getElementById('game');
const scoreTable = document.getElementById('score');
const startButton = document.getElementById('start');
const livesInfo = document.getElementById('lives');
const status = document.querySelector('.game-status');

// Sounds
const soundDot = './assets/sounds/munch.wav';
const soundPill = './assets/sounds/pill.wav';
const soundGameStart = './assets/sounds/game_start.wav';
const soundGameOver = './assets/sounds/death.wav';
const soundGhost = './assets/sounds/eat_ghost.wav';

// Game Constants
const POWER_PILL_TIME = 10000;
const ALERT_TIME = 2000;
const GLOBAL_SPEED = 80;
const gameBoard = GameBoard.createGameBoard(gameGrid, LEVEL);
const PACMAN_START_POS = 290;

// Initial Setup
let score = 0;
let timer = null;
let gameWin = false;
let powerPillActive = false;
let powerPillTimer = null;
let ghostAlertTimer = null;
let alertInterval = null;
let lives = 3;

const playAudio = (sound) => {
    const soundEffect = new Audio(sound);
    soundEffect.play();
};

const gameOver = (pacman) => {
    playAudio(soundGameOver);

    document.removeEventListener('keydown', (e) =>
        pacman.handleKeyInput(e, gameBoard.objectExist)
    );
    gameBoard.showGameStatus(gameWin);

    clearInterval(timer);
    startButton.classList.remove('hide');
    livesInfo.classList.add('hide');
};

const checkCollisions = (pacman, ghosts) => {
    const collidedGhost = ghosts.find((ghost) => pacman.pos === ghost.pos);

    if (collidedGhost) {
        if (pacman.powerPill) {
            playAudio(soundGhost);
            ghosts.forEach((ghost) => {
                if (collidedGhost.name === ghost.name) {
                    gameBoard.removeObject(collidedGhost.pos, [
                        OBJECT_TYPE.GHOST,
                        OBJECT_TYPE.SCARED,
                        collidedGhost.name,
                    ]);

                    ghost.pos = ghost.startPos;
                    score += 100;
                }
            });
        } else {
            // If you have lives continue playing from start pos
            lives--;
            if (lives) livesInfo.removeChild(livesInfo.lastElementChild);
            if (!lives) {
                gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PACMAN]);
                gameBoard.rotateDiv(pacman.pos, 0);
                gameOver(pacman);
            } else {
                gameBoard.showGameStatus(gameWin, lives);
                clearInterval(timer);
                ghosts.forEach((ghost) => {
                    gameBoard.removeObject(ghost.pos, [
                        OBJECT_TYPE.GHOST,
                        OBJECT_TYPE.SCARED,
                        ghost.name,
                    ]);

                    ghost.pos = ghost.startPos;
                });

                gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PACMAN]);
                pacman.pos = PACMAN_START_POS;

                setTimeout(() => {
                    timer = setInterval(
                        () => gameLoop(pacman, ghosts),
                        GLOBAL_SPEED
                    );
                }, ROUND_END_TIME);
            }
        }
    }
};

const gameLoop = (pacman, ghosts) => {
    gameBoard.moveCharacter(pacman);
    checkCollisions(pacman, ghosts);

    ghosts.forEach((ghost) => gameBoard.moveCharacter(ghost));
    checkCollisions(pacman, ghosts);

    // Check for dot
    if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.DOT)) {
        playAudio(soundDot);
        gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.DOT]);
        gameBoard.dotCount--;
        score += 10;
    }

    // Check for power pill
    if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.PILL)) {
        playAudio(soundPill);
        gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PILL]);

        pacman.powerPill = true;
        score += 50;

        // If another power pill was picked up clear timeouts
        clearTimeout(powerPillTimer);
        powerPillTimer = setTimeout(
            () => (pacman.powerPill = false),
            POWER_PILL_TIME
        );
        clearTimeout(ghostAlertTimer);
        ghostAlertTimer = setTimeout(() => {
            // 4 ticks to alert ghost scare effect fading
            clearInterval(alertInterval);
            alertInterval = setInterval(() => {
                ghosts.forEach((ghost) => {
                    ghost.isAlerted ^= true;
                });
            }, ALERT_TIME / 4);
            // Clearing interval
            setTimeout(() => clearInterval(alertInterval), ALERT_TIME);
        }, POWER_PILL_TIME - ALERT_TIME);
    }

    // Change ghost scare
    if (pacman.powerPill !== powerPillActive) {
        powerPillActive = pacman.powerPill;
        ghosts.forEach((ghost) => {
            ghost.isScared = pacman.powerPill;
        });
    }

    // Check for all dots
    if (!gameBoard.dotCount) {
        gameWin = true;
        gameOver(pacman, ghosts);
    }

    // Check teleport
    if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.TELEPORT_IN)) {
        gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PACMAN]);
        pacman.pos += 19;
    } else if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.TELEPORT_OUT)) {
        gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PACMAN]);
        pacman.pos -= 19;
    }

    // Show Score
    scoreTable.innerHTML = score;
};

const startGame = () => {
    playAudio(soundGameStart);

    lives = 3;
    gameWin = false;
    powerPillActive = false;
    score = 0;

    livesInfo.classList.remove('hide');
    startButton.classList.add('hide');
    status.classList.add('hide');

    gameBoard.createGrid(LEVEL);

    const pacman = new Pacman(2, PACMAN_START_POS);
    gameBoard.addObject(PACMAN_START_POS, [OBJECT_TYPE.PACMAN]);
    document.addEventListener('keydown', (e) => {
        pacman.handleKeyInput(e, gameBoard.objectExist);
    });

    const ghosts = [
        new Ghost(5, 207, randomMovement, OBJECT_TYPE.BLINKY),
        new Ghost(4, 208, randomMovement, OBJECT_TYPE.PINKY),
        new Ghost(3, 229, randomMovement, OBJECT_TYPE.INKY),
        new Ghost(2, 251, randomMovement, OBJECT_TYPE.CLYDE),
    ];

    timer = setInterval(() => gameLoop(pacman, ghosts), GLOBAL_SPEED);
};

// Initialize game
startButton.addEventListener('click', startGame);