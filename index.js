import { OBJECT_TYPE, ROUND_END_TIME, GRID_SIZE, coordsFromPos } from './src/setup.js';
import { randomMovement, moveToPacman } from './src/ghostMoves.js';

import GameBoard from './src/GameBoard.js';
import Pacman from './src/Pacman.js';
import Ghost from './src/Ghost.js';
import Level from './src/Level.js';

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

const level = new Level(GRID_SIZE);
const gameBoard = GameBoard.createGameBoard(gameGrid, level.grid);

const [PACMAN_START_POS, GHOST_START_POS] = level.calculatePositions();

// Initial Setup
let score = 0;
let timer = null;
let gameWin = false;
let powerPillActive = false;
let powerPillTimer = null;
let ghostAlertTimer = null;
let alertInterval = null;
let lives = 3;
let auto_eaten = false;

// turn off sound
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
                auto_eaten = true;
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
                auto_eaten = true;
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
    switch (gameBoard.state) {
        case 'player':
            gameBoard.moveCharacter(pacman);
            checkCollisions(pacman, ghosts);
            ghosts.forEach((ghost) => gameBoard.moveCharacter(ghost));
            checkCollisions(pacman, ghosts);
            break;
        case 'auto':
            gameBoard.findPathToFood(pacman, level.grid, auto_eaten);
            auto_eaten = false;
            checkCollisions(pacman, ghosts);
            ghosts.forEach((ghost) => gameBoard.autoMoveGhost(ghost, level.grid, coordsFromPos(pacman.pos), coordsFromPos(ghost.pos)));
            checkCollisions(pacman, ghosts);
            break;
        case 'minimax':
            let score_copy = score;
            gameBoard.minimax(pacman, level.grid, ghosts, score_copy);
            score--;    
            checkCollisions(pacman, ghosts);
            ghosts.forEach((ghost) => gameBoard.autoMoveGhost(ghost, level.grid, coordsFromPos(pacman.pos), coordsFromPos(ghost.pos)));
            checkCollisions(pacman, ghosts);
            break;
        default:
            break;
    }
    
    let startTime = performance.now()
    gameBoard.renderPaths(pacman, ghosts, level.grid);
    let endTime = performance.now()
    document.querySelector('.algorithm-name').innerHTML = gameBoard.finding.algorithm;
    document.querySelector('.algorithm-time').innerHTML = `${(endTime - startTime).toFixed(2)} milliseconds`;

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

    // TASK 2 CHANGING GAMEBOARD STATE
    gameBoard.state = 'minimax';

    gameBoard.createGrid(level.grid);

    const pacman = new Pacman(2, PACMAN_START_POS);

    gameBoard.addObject(PACMAN_START_POS, [OBJECT_TYPE.PACMAN]);
    document.addEventListener('keydown', (e) => {
        pacman.handleKeyInput(e, gameBoard.objectExist);
        if (e.keyCode === 90) {
            gameBoard.changeAlgorithm();
        }
    });

    const ghosts = [
        //new Ghost(6, GHOST_START_POS[0], moveToPacman, OBJECT_TYPE.BLINKY),
        //new Ghost(5, GHOST_START_POS[1], moveToPacman, OBJECT_TYPE.PINKY),
        new Ghost(4, GHOST_START_POS[2], randomMovement, OBJECT_TYPE.INKY),
        new Ghost(3, GHOST_START_POS[3], moveToPacman, OBJECT_TYPE.CLYDE),
    ];

    timer = setInterval(() => gameLoop(pacman, ghosts), GLOBAL_SPEED);
};

// Initialize game
startButton.addEventListener('click', startGame);
