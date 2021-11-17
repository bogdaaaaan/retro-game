import { GRID_SIZE, CELL_SIZE, OBJECT_TYPE, CLASS_LIST, ROUND_END_TIME, coordsFromPos, getCombinations } from './setup.js';
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
        this.minimax_positions = [];
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

    minimax(pacman, level, ghosts, score, chosen_algorithm) {
        // pacman needs direction to make a first move
        if (!pacman.dir) {
            pacman.dir = {
                code: 37,
                movement: -1,
                rotation: 180
            };
        }

        // pacman can't move every loop iteration 
        if (!pacman.shouldMove()) return;

        // set how much in future pacman can see
        const max_depth = Math.floor(Math.random() * (Math.floor(6) - Math.ceil(4) + 1)) + Math.ceil(4);

        // find available moves from current pacman position
        let moves = pacman.isThereMoves(this.objectExist);
        // ser variables
        let best_move = null, best_move_score = -Infinity, new_best_move_score = 0;
        // if there is no moves for pacman set his best move as current position
        if (moves.length === 0) best_move = pacman.pos;
        // if all moves are the same it means pacman is stuck and can't see further into level to find food
        let prev_pos = pacman.pos;
        let moves_history = [];
        if (moves.length) {
            // make a move and start calculating if there a better move
            for (let i = 0; i < moves.length; i++) {
                let path = [moves[i]];
                pacman.pos = moves[i];
                // get value from calculations
                new_best_move_score = chosen_algorithm === 'alphaBeta' ? this.alphaBetaPruning(max_depth, level, pacman, ghosts, score, path) : this.expectimax(max_depth, level, pacman, ghosts, score, path, true);
                // add score to list of move scores
                moves_history.push(new_best_move_score);
                // if value we get is better than previous - set best score as new value
                if (best_move_score < new_best_move_score) {
                    best_move_score = new_best_move_score;
                    best_move = moves[i];
                }
            }
        }
        // check for unique values, if there are not, then pacman is stuck
        if ([... new Set(moves_history)].length === 1) {
            best_move = this.getClosestFood(coordsFromPos(prev_pos), level);
        }
        
        this.minimax_positions.push(best_move);
        if (this.minimax_positions.length === 4) {
            
            if ([... new Set(this.minimax_positions)].length === 2) {
                best_move = this.getClosestFood(coordsFromPos(prev_pos), level);
            }
            this.minimax_positions = [];
        }

        if (!best_move) best_move = pacman.pos;
        // change level grid layout 
        let [x, y] = coordsFromPos(best_move);
        level[x][y] = 0;

        let rotation = 0;
        let movement = 0;
        let code = 0;

        let next_pos = [x,y];
        let pacman_pos = coordsFromPos(prev_pos);

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
        
        // move pacman at screen
        const { classesToRemove, classesToAdd } = pacman.makeMove();
        if (pacman.rotation && next_pos !== pacman.pos) {
            this.rotateDiv(next_pos, pacman.dir.rotation);
            this.rotateDiv(pacman.pos, 0);
        }
        this.removeObject(pacman.pos, classesToRemove);
        pacman.setNewPos(best_move);
        this.addObject(best_move, classesToAdd);

        //console.log('move done at ' + best_move + ' with best score at ' + best_move_score + ' with max_depth at ' + max_depth);
    }

    getClosestFood(from, level) {
        let to = 0;
        for (let i = 0; i < level.length; i++) {
            for (let j = 0; j < level[i].length; j++) {
                if (level[i][j] === 2 || level[i][j] === 7) {
                   to = [i, j]; 
                }
            }
        }
        let path = this.finding.dfs(level, from, to);
        if (path.length) {
            let element = path[0];
            return ((element[0] * level.length) + element[1]);
        }
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

    evaluate(depth, level, pacman, ghosts, score, path) {
        let result_score = 0;
        // finishing earlier is better
        result_score += depth * 1000;
        
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
        result_score += (pill_count * 200);
        
        // last move from path needs to be calculated
        switch (path[path.length - 1]) {
            // if last position is a dot, that means we dont have less dots than in previous calculations
            case 2:
                result_score += 10;
                break;
            // if it is pill, then we have less pills than in previous calculations
            case 7:
                result_score -= 50;
                break;
            default:
                break;
        }

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
                if (path_length && path_length <= 5) {
                    if (!path_length && path_length === 1) {
                        return -Infinity;
                    } else {
                        result_score -= Math.floor(500 / path_length);
                    }
                }
            }
        }
        return score + result_score;
    }

    expectimax(depth, level, pacman, ghosts, score, path, isMaximizing = true) {  
        let flag = false;
        if (this.isWinner(level)) {
            return this.evaluate(depth, level, pacman, ghosts, score, path) + 500;
        } else if (depth === 0) {
            // if it's last move - make it before returning value
            if (isMaximizing) {
                flag = true;
            } else {
                return this.evaluate(depth, level, pacman, ghosts, score, path);
            }
        }
        
        // pacman turn
        if (isMaximizing) {
            // set best as -infinity
            let best = -Infinity;
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
                    score += (10 + (10 * depth));
                    break;
                case 7:
                    score += (50 + (50 * depth));
                    break;
                default: 
                    break;
            }
            // if pacman ate a ghost he gets +100 point, if he collide with ghost without power pill - he loses 500 points
            for (let i = 0; i < ghosts.length; i++) {
                const ghost = ghosts[i];
                if (pacman.pos === ghost.pos) {
                    if (ghost.isScared) {
                        score += 500;
                    } else {
                        score -= 15000;
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
                value = this.alphaBetaPruning(depth-1, level, pacman, ghosts, score, path, false);
                // delete last move from path
                path.pop();
                // get best value from all available moves
                best = Math.max(best, value);
            }

            // set previous values
            score = prev_score;
            level[x][y] = eaten;
            pacman.pos = prev_move;

            return best;
        } else {
            let best = Infinity;
            
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
                let moves_actions = ghost.isThereMoves(this.objectExist);
                // if ghost has no available move - set new move to ghost current position
                actions_to_take[i] = moves_actions.length ? moves_actions : [ghost.pos];
            }
            
            let combinations = getCombinations(actions_to_take);
            let value = [];
            // for every possible combination of moves calculate result value
            for (let i = 0; i < combinations.length; i++) {
                let combo = combinations[i];
                // make a move for each ghost
                for (let j = 0; j < ghosts.length; j++) {
                    ghosts[j].pos = combo[j];
                }
                value.push(this.alphaBetaPruning(depth, level, pacman, ghosts, score, path, true));
            }

            // return ghosts to their previous positions
            for (let i = 0; i < ghosts.length; i++) {
                const ghost = ghosts[i];
                ghost.pos = prev_moves[i];
            }
            
            return Math.floor(value.reduce((previousValue, currentValue) => previousValue + currentValue) / value.length)
        }
    }

    alphaBetaPruning(depth, level, pacman, ghosts, score, path, alpha = -Infinity, beta = Infinity, isMaximizing = true) {
        let flag = false;
        if (this.isWinner(level)) {
            return this.evaluate(depth, level, pacman, ghosts, score, path) + 500;
        } else if (depth === 0) {
            // if it's last move - make it before returning value
            if (isMaximizing) {
                flag = true;
            } else {
                return this.evaluate(depth, level, pacman, ghosts, score, path);
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
                    score += (10 + (10 * depth));
                    break;
                case 7:
                    score += (50 + (50 * depth));
                    break;
                default: 
                    break;
            }

            //if pacman ate a ghost he gets +100 point, if he collide with ghost without power pill - he loses 500 points
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
                let moves_actions = ghost.isThereMoves(this.objectExist);
                // if ghost has no available move - set new move to ghost current position
                actions_to_take[i] = moves_actions.length ? moves_actions : [ghost.pos];
            }

            let combinations = getCombinations(actions_to_take);
            let value = 0;
            // for every possible combination of moves calculate result value
            for (let i = 0; i < combinations.length; i++) {
                let combo = combinations[i];
                // make a move for each ghost
                for (let j = 0; j < ghosts.length; j++) {
                    ghosts[j].pos = combo[j];
                }
                value = this.alphaBetaPruning(depth, level, pacman, ghosts, score, path, alpha, beta, true);

                best = Math.min(best, value)
                beta = Math.min(beta, best);
                if (alpha <= beta) break;
            }

            // return ghosts to their previous positions
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
