import { coordsFromPos, GRID_SIZE } from './setup.js';

export default class PathFinding {
    constructor() {
        this.algorithm = null;
    }

    // bfs(from, to, map) {
    //     const [from_x, from_y] = coordsFromPos(from);
    //     const [to_x, to_y] = coordsFromPos(to);
    //     let arr = [...map];

    //     // Directions
    //     const dir = [ [ 0, 1 ], [ 0, -1 ], [ -1, 0 ], [ 1, 0 ] ];

    //     // Queue
    //     let q = [];

    //     // Insert the start point
    //     q.push([from_x, from_y]);
        
    //     // Until queue is empty 
    //     while (q.length > 0) {
    //         let p = q[0];
    //         q.shift();
    //         // Mark as visited
    //         arr[p[0]][p[1]] = 1;

    //         // Destination is reached. 
    //         if (p[0] === to_x && p[1] === to_y) {
    //             //console.log(arr, path);
    //             return true;
    //         }

    //         // Check all four directions
    //         for(let i = 0; i < 4; i++) {

    //             // Using the direction array
    //             let a = p[0] + dir[i][0];
    //             let b = p[1] + dir[i][1];
    //             // Not blocked and valid
    //             if (arr[a][b] != 1) {
    //                 q.push([a,b]);
    //             }
    //         }
    //     }
    //     //console.log(arr, path);
    //     return false;   
    // }
}