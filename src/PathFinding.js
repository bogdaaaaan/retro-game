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
        
        function node(coords, cost) {
            this.coords = coords;
            this.cost = cost;
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
                    return path;
                } 
      
                let adjacent = [];
                //check all four directions
                for(let i = 0; i < 4 ;i++) {
                    //using the direction array
                    let [a, b] = [point[0] + dir[i][0], point[1] + dir[i][1]];
                    if (a < 0 || b < 0 || a >= visited.length || b >= visited.length) continue;
                    adjacent.push(new node([a,b], cost+1));
                }
          
                adjacent.sort((a,b) => (a.cost > b.cost) ? 1 : ((b.cost > a.cost) ? -1 : 0))
      
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
                            return new_path;
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
        if (found) return final_path;
        return false;
    }
}