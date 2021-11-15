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
        this.state = '';
        this.path_to_food = [];
        this.prev_food_pos = null;
        this.ghost_paths = [];
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
            const { nextMovePos, direction } = character.getNextMove(this.objectExist);

            if (character.pos === nextMovePos && character.dir === direction) return;
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

// <-------------- MINIMAX --------------> //

    minimax(pacman, level, ghosts, score) {
        // pacman needs direction to make a move
        pacman.dir = {
            code: 37,
            movement: -1,
            rotation: 180
        };

        // pacman can't move every loop iteration 
        if (!pacman.shouldMove()) return;

        // set how much in future pacman can see
        const max_depth = (level.length - 2);

        // find available moves from current pacman position
        let moves = pacman.isThereMoves(this.objectExist);
        // ser variables
        let best_move = null, best_move_score = 0, new_best_move_score = 0;
        // if there is no moves for pacman set his best move as current position
        if (moves.length === 0) best_move = pacman.pos;
        if (best_move === null) best_move = pacman.pos;

        // make a move and start calculating if there a better move
        for (let i = 0; i < moves.length; i++) {
            let path = [moves[i]];
            pacman.pos = moves[i];

            // get value from calculations
            new_best_move_score = this.alphaBetaPruning(max_depth, level, pacman, ghosts, score, path);
            
            // if value we get is better than previous - set best score as new value
            if (best_move_score < new_best_move_score) {
                best_move_score = new_best_move_score;
                best_move = moves[i];
            }
            debugger;
        }

        // change level grid layout 
        let [x, y] = coordsFromPos(best_move);
        level[x][y] = 0;

        // move pacman at screen
        const { classesToRemove, classesToAdd } = pacman.makeMove();
        this.removeObject(pacman.pos, classesToRemove);
        pacman.setNewPos(best_move);
        this.addObject(best_move, classesToAdd);

        console.log('move done at ' + best_move + ' with best score at ' + best_move_score);
    }

    isWinner(level) {
        // check if there dots in level left
        let dot_count = 0;
        for (let i = 0; i < level.length; i++) {
            for (let j = 0; j < level[i].length; j++) {
                if (level[i][j] === 2 || level[i][j] === 7) {
                    dot_count++;
                }
            }
        }
        // if there is no dots return true as a win state for pacman, otherwise return false 
        return dot_count ? false : true;
    }

    evaluate(depth, level, pacman, ghosts, score) {
        let result_score = 0;
        // finishing earlier is better
        result_score += depth * 100;
        
        let dot_count = 0;
        let pill_count = 0;
        for (let i = 0; i < level.length; i++) {
            for (let j = 0; j < level[i].length; j++) {
                if (level[i][j] === 0) dot_count++;
                if (level[i][j] === 7) pill_count++;
            }
        }
        // having less dots is better
        result_score += (dot_count * 10);
        // having more pills is better
        result_score += (pill_count * 50);
        // being on empty squares is worse 

        for (let i = 0; i < ghosts.length; i++) {
            const ghost = ghosts[i];
            const path_length = this.ghost_paths[ghost.name] ? this.ghost_paths[ghost.name].length : 0;
            // having ghost in prison is better
            if (!path_length && ghost.pos !== pacman.pos) {
                result_score += 50;
            }
            // being far from ghost is better when ghosts is not scared and vice versa
            if (ghost.isScared) {
                if (path_length !== 0) {
                    result_score += Math.floor(100 / path_length);
                } else {
                    result_score += 200;
                }
                
            } else {
                result_score += (path_length * 10);
            }
        }
        return score + result_score;
    }

    alphaBetaPruning(depth, level, pacman, ghosts, score, path, alpha = -Infinity, beta = Infinity, isMaximizing = true) {
        //console.log('Current depth is: ', depth, ', current score is: ', score, ', current move is: ', move);
        
        let flag = false;
        if (this.isWinner(level)) {
            return this.evaluate(depth, level, pacman, ghosts, score) + 500;
        } else if (depth === 0) {
            // if it's last move - make it before returning value
            if (isMaximizing) {
                flag = true;
            } else {
                return this.evaluate(depth, level, pacman, ghosts, score);
            }
        }
        
        // pacman turn
        if (isMaximizing) {
            // set best as -infinity
            let best = alpha;
            // save all previous states
            let prev_score = score;
            let prev_move = pacman.pos;


            // get info about current position on level grid
            let [x,y] = coordsFromPos(pacman.pos);
            let eaten = level[x][y];
            if (!flag) level[x][y] = 0;
            // if pacman ate dot he gets +10 point, if pill - gets +50
            switch(eaten) {
                case 2:
                    score += 10;
                    break;
                case 7:
                    score += 50;
                    break;
                default: 
                    break;
            }

            // if pacman ate a ghost he gets +100 point, if he collide with ghost without power pill - he loses 500 points
            for (let i = 0; i < ghosts.length; i++) {
                const ghost = ghosts[i];
                if (pacman.pos === ghost.pos) {
                    if (ghost.isScared) {
                        score += 100;
                    } else {
                        score -= 500;
                    }
                }
            }

            // every turn score decreases by one point
            score--;

            // if it's last pacman move, return score value 
            if (flag) return this.evaluate(depth, level, pacman, ghosts, score);

            // find available moves from current
            let available_moves = pacman.isThereMoves(this.objectExist);

            let value = 0;
            for (let i = 0; i < available_moves.length; i++) {
                // update path 
                const next_move = available_moves[i];
                path.push(next_move);
                // make a move
                pacman.pos = next_move;

                // get best value
                value = this.alphaBetaPruning(depth-1, level, pacman, ghosts, score, path, alpha, beta, false);
                // delete last move from path
                path.pop();

                // get best value from all available moves
                best = Math.max(best, value);

                // if there is no better value in lower parts of minimax tree - break out of loop
                alpha = Math.max(alpha, best);
                if (beta <= alpha) break;
            }

            // set previous values
            score = prev_score;
            level[x][y] = eaten;
            pacman.pos = prev_move;

            return best;
        } else {
            let best = beta;
            
            // save moves before ghost turn
            let prev_moves = [];
            for (let i = 0; i < ghosts.length; i++) {
                const ghost = ghosts[i];
                prev_moves.push(ghost.pos);
            }

            // find available moves
            let actions_to_take = [];
            for (let i = 0; i < ghosts.length; i++) {
                const ghost = ghosts[i];
                actions_to_take[i] = ghost.isThereMoves(this.objectExist);
            }

            // combine them into one array of all moves 
            function allPossibleCases(arr) {
                if (arr.length == 1) {
                  return arr[0];
                } else {
                  var result = [];
                  var allCasesOfRest = allPossibleCases(arr.slice(1));  // recur with the rest of array
                  for (var i = 0; i < allCasesOfRest.length; i++) {
                    for (var j = 0; j < arr[0].length; j++) {
                      result.push(arr[0][j] + ',' + allCasesOfRest[i]);
                    }
                  }
                  return result;
                }
              
            }
            let combinations = allPossibleCases(actions_to_take);
            combinations = combinations.map(x => {
                x = x.split(',').map(e => {
                    return Number(e);
                });
                return x;
            });
            let value = 0;

            for (let i = 0; i < combinations.length; i++) {
                let combo = combinations[i];
                for (let j = 0; j < ghosts.length; j++) ghosts[j].pos = combo[j];

                value = this.alphaBetaPruning(depth, level, pacman, ghosts, score, path, alpha, beta, true);

                best = Math.min(best, value)
                beta = Math.min(beta, best);
                if (alpha <= beta) break;
            }

            for (let i = 0; i < ghosts.length; i++) {
                const ghost = ghosts[i];
                ghost.pos = prev_moves[i];
            }
            
            return best;
        }
    }

    // <-------------- MINIMAX --------------> //

    autoMoveGhost(ghost, level, pacman_pos, ghost_pos) {
        if (ghost.shouldMove()) {
            let path;

            switch (this.finding.algorithm) {
                case 'bfs':
                    path = this.finding.bfs(level, pacman_pos, ghost_pos);
                    break;
                case 'dfs':
                    path = this.finding.dfs(level, pacman_pos, ghost_pos);
                    break;
                case 'ucs':
                    path = this.finding.ucs(level, pacman_pos, ghost_pos);
                    break;
                default:
                    break;
            }

            const {nextMovePos, direction} = path && path.length <= Math.floor((level.length / ghost.speed) + ghost.speed) ? ghost.getNextMove(this.objectExist, path.pop()) : ghost.getNextMove(this.objectExist);

            if (ghost.pos === nextMovePos && ghost.dir === direction) return;
            const { classesToRemove, classesToAdd } = ghost.makeMove();

            if (ghost.rotation && nextMovePos !== ghost.pos) {
                this.rotateDiv(nextMovePos, ghost.dir.rotation);
                this.rotateDiv(ghost.pos, 0);
            }

            this.removeObject(ghost.pos, classesToRemove);
            this.addObject(nextMovePos, classesToAdd);

            ghost.setNewPos(nextMovePos, direction);
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

    // find path to food object
    findPathToFood(pacman, level, auto_eaten) {
        if (auto_eaten) {
            this.path_to_food = [];
        }
        // add random point where pacman will go 
        function spawn_food() {
            let safe_point = true;
            let to = null;
            while(safe_point) {
                let rand_row = Math.floor(Math.random() * ((level.length - 1) - 1) + 1);
                let rand_col = Math.floor(Math.random() * ((level.length - 1) - 1) + 1);
                if (level[rand_row][rand_col] === 2 || level[rand_row][rand_col] === 0) {
                    to = [rand_row, rand_col];
                    safe_point = false;
                    return to;
                }
            }
        }
        

        // find path to that point
        const pacman_pos = coordsFromPos(pacman.pos);
        if (this.path_to_food.length === 0) {
            let to = null;
            if (auto_eaten) {
                to = this.prev_food_pos;
            } else {
                to = spawn_food();
                this.prev_food_pos = to;
            }
            this.addObject(to, [OBJECT_TYPE.FOOD])
            const path = this.finding.astar(level, pacman_pos, to);
            this.path_to_food = [...path];
        } else {
            // in case we have one more move before getting food, delete it from board
            pacman.dir = {
                code: 37,
                movement: -1,
                rotation: 180
            };
            if (pacman.shouldMove()) {
                let next_pos = this.path_to_food.shift();
                
                let rotation = 0;
                let movement = 0;
                let code = 0;

                if (next_pos[0] === pacman_pos[0] && next_pos[1] > pacman_pos[1]) {
                    code = 39;
                    movement = 1;
                    rotation = 0;
                } else if (next_pos[0] === pacman_pos[0] && next_pos[1] < pacman_pos[1]) {
                    code = 37;
                    movement = -1;
                    rotation = 180;
                } else if (next_pos[0] > pacman_pos[0] && next_pos[1] === pacman_pos[1]) {
                    code = 40;
                    movement = level.length;
                    rotation = 90;
                } else if (next_pos[0] < pacman_pos[0] && next_pos[1] === pacman_pos[1]) {
                    code = 38;
                    movement = -level.length;
                    rotation = 270;
                }

                pacman.dir = {
                     code,
                     movement,
                     rotation
                };


                const { classesToRemove, classesToAdd } = pacman.makeMove();
                if (pacman.rotation && next_pos !== pacman.pos) {
                    this.rotateDiv(next_pos, pacman.dir.rotation);
                    this.rotateDiv(pacman.pos, 0);
                }
    
                this.removeObject(pacman.pos, classesToRemove);
                this.addObject(next_pos, classesToAdd);
    
                pacman.setNewPos(next_pos[0] * level.length + next_pos[1]);
                if (this.path_to_food.length === 0) {
                    this.removeObject(next_pos, [OBJECT_TYPE.FOOD])
                    level[next_pos[0]][next_pos[1]] = 0;
                }
            }
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
                    path = this.finding.ucs(level, pacman_pos, ghost_pos);
                    break;
                default:
                    break;
            }

            //set paths for ghosts
            this.ghost_paths[ghost.name] = path;
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
