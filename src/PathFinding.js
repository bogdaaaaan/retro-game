import { coordsFromPos, GRID_SIZE } from './setup.js';

export default class PathFinding {
    constructor() {
        this.algorithm = null;
    }

    bfs(arr, from, to) {
        //directions
        // right, left, down, up
        let dir = [ [0,1], [0,-1], [1,0], [-1,0]];
    
        //queue
        const q = [];
         
        //insert the top right corner.
        q.push(from);
        
        // path
        const path = [];
        path.push(from)
    
        //until queue is empty
        while(q.length > 0) {       
            let p = q.shift();
    
            //mark as visited
            arr[p[0]][p[1]] = -1;
             
            //destination is reached.
            if(p[0] === to[0] && p[1] === to[1]) {
                console.log(path);
                return true;
            } 
    
            //check all four directions
            for(let i = 0; i < 4 ;i++) {
                //using the direction array
                let [a, b] = [ p[0] + dir[i][0], p[1] + dir[i][1]];
                if (a < 0 || b < 0 || a >= arr.length || b >= arr.length) continue;
    
                //not blocked and valid
                if(arr[a][b] !== -1 ) {
                    if(a === to[0] && b === to[1]) {
                        console.log(path);
                        return true;
                    }
                    path.push([a,b]);
                    q.push([a,b]);
                }
            }
        }
        return false;
    }
}