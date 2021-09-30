export default class PathFinding {
    constructor() {
        this.algorithm = 'bfs';
        this.prev_paths = [];
    }

    bfs(arr, from, to) {
        // making array with visited nodes
        let visited = [];
        for (let i = 0; i < arr.length; i++) {
            visited[i] = [];
        }

        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr[i].length; j++) {
                switch (arr[i][j]) {
                    case 1:
                    case 9:
                        visited[i][j] = true;
                        break;
                    default:
                        visited[i][j] = false;
                        break;
                }
            }
        }

        //directions
        // right, left, down, up
        const dir = [ [0,1], [0,-1], [1,0], [-1,0]];

        //queue
        let q = [];
        
        //insert start cell 
        q.push([from]);

        //until queue is empty
        while(q.length > 0) {
            let paths = q;
            q = []; 
            while(paths.length > 0) {
                let path = paths.shift();
                let p = path[path.length-1];
    
                //mark as visited
                visited[p[0]][p[1]] = true;
                
                //destination is reached.
                if(p[0] === to[0] && p[1] === to[1]) {
                    path.shift();
                    path.pop();
                    return path;
                } 
    
                //check all four directions
                for(let i = 0; i < 4 ;i++) {
                    //using the direction array
                    let [a, b] = [ p[0] + dir[i][0], p[1] + dir[i][1]];
                    if (a < 0 || b < 0 || a >= visited.length || b >= visited.length) continue;
    
                    let new_path = [];
                    //not blocked and valid
                    if(!visited[a][b]) {
                        if(a === to[0] && b === to[1]) {
                            new_path.push(...path);
                            new_path.shift();
                            return new_path;
                        }
    
                        let flag = false;
                        for (let i = 0; i < path.length; i++) {
                            if (path[i][0] === a && path[i][1] === b) {
                                flag = true;
                            }
                        }
    
                        if (!flag) {
                            new_path.push(...path, [a,b]);
                            q.push(new_path);
                        }
                    }
                }
            }
        }
        return false;
    }

    dfs(arr, from, to) {
        // making array with visited nodes
        let visited = [];
        for (let i = 0; i < arr.length; i++) {
            visited[i] = [];
        }

        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr[i].length; j++) {
                switch (arr[i][j]) {
                    case 1:
                    case 9:
                        visited[i][j] = true;
                        break;
                    default:
                        visited[i][j] = false;
                        break;
                }
            }
        }

        //directions
        // right, left, down, up
        const dir = [ [0,1], [0,-1], [1,0], [-1,0]];
        //queue
        let q = [];
        
        //insert start cell
        q.push([from]);

        //until queue is empty
        while(q.length > 0) {      
            let path = q.shift();
            let p = path[path.length-1];

            //mark as visited
            visited[p[0]][p[1]] = true;
            
            //destination is reached.
            if(p[0] === to[0] && p[1] === to[1]) {
                path.shift();
                path.pop();
                return path;
            } 

            let adjacent = [];
            //check all four directions
            for(let i = 0; i < 4 ;i++) {
                //using the direction array
                let [a, b] = [ p[0] + dir[i][0], p[1] + dir[i][1]];
                if (a < 0 || b < 0 || a >= visited.length || b >= visited.length) continue;
                adjacent.push([a,b]);
            }
      
            for (let i = adjacent.length - 1; i >= 0; i--) {
                let new_path = [];
                let node = adjacent[i];
                //not blocked and valid
                if(!visited[node[0]][node[1]]) {
                    if(node[0] === to[0] && node[1] === to[1]) {
                        new_path.push(...path);
                        new_path.shift();
                        return new_path;
                    }

                    let flag = false;
                    for (let i = 0; i < path.length; i++) {
                        if (path[i][0] === node[0] && path[i][1] === node[1]) {
                            flag = true;
                        }
                    }

                    // main difference:
                    if (!flag) {
                        new_path.push(...path, node);
                        q.push(new_path);
                    }
                }
            } 
        }
        return false;
    }

    ucs(arr, from, to) {
        // making array with visited nodes
        let visited = [];
        for (let i = 0; i < arr.length; i++) {
            visited[i] = [];
        }
      
        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr[i].length; j++) {
                switch (arr[i][j]) {
                    case 1:
                    case 9:
                        visited[i][j] = true;
                        break;
                    default:
                        visited[i][j] = false;
                        break;
                }
            }
        }
      
        //directions
        // right, left, down, up
        const dir = [ [0,1], [0,-1], [1,0], [-1,0]];
      
        //queue
        let q = [];
        
        class node {
            constructor(coords, cost) {
                this.coords = coords;
                this.cost = cost;
            }
        }
      
        //insert start cell and cost
        q.push([new node(from, 0)]);
      
        let found = false;
        let final_path = null;
        //until queue is empty
        while(!found) {
            let paths = q;
            q = []; 
            while(paths.length > 0) {
                let path = paths.shift();
                let p = path[path.length-1];
                let point = p.coords;
                let cost = p.cost;
      
                //mark as visited
                visited[point[0]][point[1]] = true;
                
                //destination is reached.
                if(point[0] === to[0] && point[1] === to[1]) {
                    path.shift();
                    path.pop();
                    found = true;
                    final_path = path;
                    
                    let ret_path = [];
                    for (let i = 0; i < final_path.length; i++) {
                        ret_path.push(final_path[i].coords);
                    }
                    return ret_path;        
                } 
      
                let adjacent = [];
                //check all four directions
                for(let i = 0; i < 4 ;i++) {
                    //using the direction array
                    let [a, b] = [point[0] + dir[i][0], point[1] + dir[i][1]];
                    if (a < 0 || b < 0 || a >= visited.length || b >= visited.length) continue;
                    adjacent.push(new node([a,b], cost+1));
                }
          
                adjacent.sort((a,b) => (a.cost > b.cost) ? 1 : ((b.cosыt > a.cost) ? -1 : 0))
      
                adjacent.forEach(_node => {
                    let new_path = [];
                    let [a,b] = _node.coords;
                    //not blocked and valid
                    if(!visited[a][b]) {
                        if(a === to[0] && b === to[1]) {
                            new_path.push(...path);
                            new_path.shift();
                            found = true;
                            final_path = new_path;

                            let ret_path = [];
                            for (let i = 0; i < final_path.length; i++) {
                               ret_path.push(final_path[i].coords);
                            }
                            return ret_path;
                        }
      
                        let flag = false;
                        for (let i = 0; i < path.length; i++) {
                            if (path[i][0] === a && path[i][1] === b) {
                                flag = true;
                            }
                        }
      
                        if (!flag) {
                            new_path.push(...path, new node([a,b], cost+1));
                            q.push(new_path);
                        }
                    }
                })                
            }
        }
        
        if (found) {
            let ret_path = [];
            for (let i = 0; i < final_path.length; i++) {
                ret_path.push(final_path[i].coords);
            }
            return ret_path;
        }
        return false;
    }

    astar (arr, start, end) {
        let grid = new Array(arr.length);
        for (let i = 0; i < grid.length; i++) {
            grid[i] = new Array(arr.length);
        }
    
        for (let x = 0; x < grid.length; x++) {
            for (let y = 0; y < grid[x].length; y++) {
                grid[x][y] = {
                    val: arr[x][y],
                    pos: [x,y],
                    f: 0,
                    g: 0,
                    h: 0,
                    parent: null
                };
            }
        }
    
        function heuristic (pos0, pos1) {
            let d1 = Math.abs(pos1.x - pos0.x);
            let d2 = Math.abs(pos1.y - pos0.y);
            return d1 + d2;
        }
    
        let start_node = grid[start[0]][start[1]];
        let end_node = grid[end[0]][end[1]];
    
        let openList = [];
        let closedList = [];
    
        openList.push(start_node);
        while (openList.length > 0) {
            let lowInd = 0;
            for (let i = 0; i < openList.length; i++) {
                if (openList[i].f < openList[lowInd].f) {
                    lowInd = i;
                }
            }
            let currentNode = openList[lowInd]; 
            if (currentNode.pos[0] === end_node.pos[0] && currentNode.pos[1] === end_node.pos[1]) {
                let curr = currentNode;
                let ret = [];
                while (curr.parent) {
                    ret.push(curr.pos);
                    curr = curr.parent;
                }
                ret.reverse();
                return ret;
            }
    
            openList.splice(openList.indexOf(currentNode), 1);
            closedList.push(currentNode);
    
            const dir = [[0,1], [0,-1], [1,0], [-1,0]];
            let neighbors = [];
            for (let i = 0; i < dir.length; i++) {
                const direction = dir[i];
                let [a,b] = [currentNode.pos[0] + direction[0], currentNode.pos[1] + direction[1]];
                if (a > grid.length - 1 || a < 0 || b > grid.length - 1 || b < 0) continue;
                if (grid[a][b].val === 9 || grid[a][b] === 1) continue;
                neighbors.push(grid[a][b]);
            }
    
            for (let i = 0; i < neighbors.length; i++) {
                let neighbor = neighbors[i];
                if (closedList.indexOf(neighbor) !== -1 || neighbor.val === 9 || neighbor.val === 1) {
                    continue;
                }
                let gScore = currentNode.g + 1;
                let gScoreIsBest = false;
    
                if (openList.indexOf(neighbor) === -1) {
                    gScoreIsBest = true;
                    neighbor.h = heuristic(neighbor.pos, end_node.pos);
                    openList.push(neighbor);
                } else if (gScore < neighbor.g) {
                    gScoreIsBest = true;
                }
    
                if (gScoreIsBest) {
                    neighbor.parent = currentNode;
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;
                }
            }
        }
        return false;
    }
}