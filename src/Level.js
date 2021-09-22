export default class Level {
    constructor(size) {
        this.size = size;
        this.pacman_pos = null;
        this.ghosts_pos = null;
        this.grid = null;
        this.generatePathSystem();
    }

    generatePathSystem() {
        // create level matrix
        let _map = new Array(this.size);
        for (let i = 0; i < this.size; i++) {
            _map[i] = new Array(this.size)
        }

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                _map[i][j] = 1;
            }
        }
        
        let dimensions = this.size - 1, maxLength = 10, maxTunnels = this.size * 3;

        // get random position
        let currentRow = Math.floor(Math.random() * (dimensions - 1) + 1),
        currentColumn = Math.floor(Math.random() * (dimensions - 1) + 1);

        let directions = [[-1, 0], [1, 0], [0, -1], [0, 1]], lastDirection = [], randomDirection;

        while (maxTunnels && dimensions && maxLength) {

        // get a random direction - until it is a perpendicular to lastDirection
        // if the last direction = left or right, then our new direction has to be up or down and vice versa
        do {
            randomDirection = directions[Math.floor(Math.random() * directions.length)]
        } while 
            ((randomDirection[0] === -lastDirection[0] && randomDirection[1] === -lastDirection[1]) || 
            (randomDirection[0] === lastDirection[0] && randomDirection[1] === lastDirection[1]));
            
        let randomLength = Math.ceil(Math.random() * maxLength), tunnelLength = 0; 

        // loop until tunnel is long enough or until we hit an edge
        while (tunnelLength < randomLength) {
            //break the loop if it is going out of the _map
            if (((currentRow === 1) && (randomDirection[0] === -1)) ||
                ((currentColumn === 1) && (randomDirection[1] === -1)) ||
                ((currentRow === dimensions - 1) && (randomDirection[0] === 1)) ||
                ((currentColumn === dimensions - 1) && (randomDirection[1] === 1))) {
                    break;
            } else {
                _map[currentRow][currentColumn] = 0;
                currentRow += randomDirection[0];
                currentColumn += randomDirection[1];
                tunnelLength++;
                }
            }

            if (tunnelLength) {
                lastDirection = randomDirection; 
                maxTunnels--;
            }    
        }

        // create ghosts spawn point
        const center = _map.length / 2;
        const spawn_offset = Math.floor(Math.random() * ((_map.length - 4) - 4) ) + 4;

        for (let i = -3; i < 4; i++) {
            for (let j = -4; j < 4; j++) {
                _map[i + spawn_offset][center + j] = 0;
            }
        }
        
        for (let i = -2; i < 3; i++) {
            for (let j = -3; j < 3; j++) {
                _map[i + spawn_offset][center + j] = 1;
            }
        }

        for (let i = -2; i < 2; i++) {
            for (let j = -2; j < 2; j++) {
                _map[i + spawn_offset][center + j] = 9;
            }
        }

        // add dots
        for (let i = 0; i < _map.length; i++) {
            for (let j = 0; j < _map.length; j++) {
                if (!_map[i][j]) _map[i][j] = 2;
            }
        }

        // add boosters
        let booster_count = 4;
        while(booster_count) {
            let rand_row = Math.floor(Math.random() * ((_map.length - 1) - 1) + 1);
            let rand_col = Math.floor(Math.random() * ((_map.length - 1) - 1) + 1);
            if (_map[rand_row][rand_col] === 2) {
                _map[rand_row][rand_col] = 7;
                booster_count--;
            }
        }

        this.grid = _map;
        return _map;
    }
    
    calculatePositions() {
        let positions = [];
        let flag = true;
        let indx = null;
        let grid_indx = null;

        this.grid.map(x => {
            if (flag) {
                indx = x.indexOf(9);
                if (indx !== -1) {
                    flag = false;
                    grid_indx = this.grid.indexOf(x);
                }
            }
        });

        for (let i = 0; i < 4; i++) {
            positions.push((grid_indx + i) * this.size + indx + i);
        }
        this.ghosts_pos = positions;
        this.pacman_pos = (positions[positions.length - 1]) + (this.size * 2) - 2;
        return [this.pacman_pos, this.ghosts_pos];
    }

    getGhostPositions() {
        return this.ghosts_pos;
    }

    getPacmanPosition() {
        return this.pacman_pos;
    } 
}