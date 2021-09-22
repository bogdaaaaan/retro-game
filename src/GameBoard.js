import { GRID_SIZE, CELL_SIZE, OBJECT_TYPE, CLASS_LIST, ROUND_END_TIME, coordsFromPos } from './setup.js';
import PathFinding from './PathFinding.js';

export default class GameBoard {
    constructor(DOMGrid) {
        this.dotCount = 0;
        this.finding = new PathFinding();
        this.grid = new Array(GRID_SIZE);
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = new Array(GRID_SIZE);
        }

        this.DOMGrid = DOMGrid;
    }

    showGameStatus(gameWin, lives) {
        const div = document.querySelector('.game-status');
        div.classList.remove('hide');
        let end = setTimeout(() => div.classList.add('hide'), ROUND_END_TIME);
        switch (lives) {
            case 2:
                div.innerHTML = `YOU HAVE 2 LIVES LEFT!`;
                break;
            case 1:
                div.innerHTML = `YOU HAVE 1 LIFE LEFT!`;
                break;
            default:
                clearTimeout(end);
                div.innerHTML = `${gameWin ? 'YOU HAVE WON!' : 'GAME OVER'}`;
                break;
        }
    }

    createGrid(level) {
        this.dotCount = 0;
        this.grid = new Array(GRID_SIZE);
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = new Array(GRID_SIZE);
        }

        this.DOMGrid.innerHTML = '';
        this.DOMGrid.style.cssText = `grid-template-columns: repeat(${GRID_SIZE}, ${CELL_SIZE}px);`;

        for (let i = 0; i < level.length; i++) {
            for (let j = 0; j < level[i].length; j++) {
                const div = document.createElement('div');
                div.classList.add('square', CLASS_LIST[level[i][j]]);
                div.style.cssText = `width: ${CELL_SIZE}px; height: ${CELL_SIZE}px;`;
                this.DOMGrid.appendChild(div);
                this.grid[i][j] = div;
    
                if (CLASS_LIST[level[i][j]] === OBJECT_TYPE.DOT) this.dotCount++;
            }
        }       
    }

    addObject(pos, classes) {
        const [pos_x, pos_y] = coordsFromPos(pos);
        this.grid[pos_x][pos_y].classList.add(...classes);
    }

    removeObject(pos, classes) {
        const [pos_x, pos_y] = coordsFromPos(pos);
        this.grid[pos_x][pos_y].classList.remove(...classes);
    }

    objectExist = (pos, object) => {
        const [pos_x, pos_y] = coordsFromPos(pos);
        return this.grid[pos_x][pos_y].classList.contains(object);
    };

    rotateDiv(pos, deg) {
        const [pos_x, pos_y] = coordsFromPos(pos);
        this.grid[pos_x][pos_y].style.transform = `rotate(${deg}deg)`;
    }

    moveCharacter(character) {
        if (character.shouldMove()) {
            const { nextMovePos, direction } = character.getNextMove(
                this.objectExist
            );

            if (character.pos === nextMovePos && character.dir === direction)
                return;
            const { classesToRemove, classesToAdd } = character.makeMove();

            if (character.rotation && nextMovePos !== character.pos) {
                this.rotateDiv(nextMovePos, character.dir.rotation);
                this.rotateDiv(character.pos, 0);
            }

            this.removeObject(character.pos, classesToRemove);
            this.addObject(nextMovePos, classesToAdd);

            character.setNewPos(nextMovePos, direction);
        }
    }

    changeAlgorithm() {
        switch (this.finding.algorithm) {
            case 'bfs':
                this.finding.algorithm = 'dfs';
                break;
            case 'dfs':
                this.finding.algorithm = 'ucs';
                break;
            case 'ucs':
                this.finding.algorithm = 'bfs';
                break;
            default:
                break;
        }
    }

    // render paths depending on selected algorithm
    renderPaths(pacman, ghosts, level) {
        const pacman_pos = coordsFromPos(pacman.pos);
    
        if (this.finding.prev_paths.length) {
            this.finding.prev_paths.map(prev_path => {
                if (prev_path) {
                    prev_path.map(x => {
                        let x_pos = (x[0] * this.grid.length) + x[1];
                        this.removeObject(x_pos, [OBJECT_TYPE.PATH, OBJECT_TYPE.BLINKY_PATH, OBJECT_TYPE.PINKY_PATH, OBJECT_TYPE.INKY_PATH, OBJECT_TYPE.CLYDE_PATH]);
                    })
                }
                
            })
        }

        let iter = 0;
        ghosts.map(ghost => {
            let path_color = null;
            switch (ghost.name) {
                case OBJECT_TYPE.BLINKY:
                    path_color = OBJECT_TYPE.BLINKY_PATH;
                    break;
                case OBJECT_TYPE.PINKY:
                    path_color = OBJECT_TYPE.PINKY_PATH;
                    break;
                case OBJECT_TYPE.INKY:
                    path_color = OBJECT_TYPE.INKY_PATH;
                    break;
                case OBJECT_TYPE.CLYDE:
                    path_color = OBJECT_TYPE.CLYDE_PATH;
                    break;
                default: 
                    break;
            }
            

            // bfs for paths from pacman to each ghost
            const ghost_pos = coordsFromPos(ghost.pos);
            let path = null;
            switch (this.finding.algorithm) {
                case 'bfs':
                    path = this.finding.bfs(level, pacman_pos, ghost_pos);
                    break;
                case 'dfs':
                    path = this.finding.dfs(level, pacman_pos, ghost_pos);
                    break;
                case 'ucs':
                    path = this.finding.bfs(level, pacman_pos, ghost_pos);
                    break;
                default:
                    break;
            }

            // set new path 
            this.finding.prev_paths[iter] = path;
            iter++;

            if (path) {
                path.map(x => {
                    let x_pos = (x[0] * this.grid.length) + x[1];
                    this.addObject(x_pos, [OBJECT_TYPE.PATH, path_color]);
                })
            }
        });
    }

    static createGameBoard(DOMGrid, level) {
        const board = new this(DOMGrid);
        board.createGrid(level);
        return board;
    }
}
