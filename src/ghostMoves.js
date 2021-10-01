import { DIRECTIONS, OBJECT_TYPE, GRID_SIZE, coordsFromPos } from "./setup.js";

export function randomMovement(position, direction, objectExist) {
    if (
        (objectExist(position - 1, OBJECT_TYPE.WALL) || objectExist(position - 1, OBJECT_TYPE.GHOST)) &&
        (objectExist(position + 1, OBJECT_TYPE.WALL) || objectExist(position + 1, OBJECT_TYPE.GHOST)) &&
        (objectExist(position - GRID_SIZE, OBJECT_TYPE.WALL) || objectExist(position - GRID_SIZE, OBJECT_TYPE.GHOST)) &&
        (objectExist(position + GRID_SIZE, OBJECT_TYPE.WALL) || objectExist(position + GRID_SIZE, OBJECT_TYPE.GHOST))
    ) { 
        return { nextMovePos: position, direction };
    }

    let dir = direction;
    let nextMovePos = position + dir.movement;

    const keys = Object.keys(DIRECTIONS);

    while (objectExist(nextMovePos, OBJECT_TYPE.WALL) || objectExist(nextMovePos, OBJECT_TYPE.GHOST)) {
        // Get random direction
        const key = keys[Math.floor(Math.random() * keys.length)];
         // Set next Move
        dir = DIRECTIONS[key];
        nextMovePos = position + dir.movement;
    }
    
    return { nextMovePos, direction: dir };
}

export function moveToPacman(position, direction, objectExist, auto_path) {
    if (!auto_path) {
        return randomMovement(position, direction, objectExist);
    }

    if (
        (objectExist(position - 1, OBJECT_TYPE.WALL) || objectExist(position - 1, OBJECT_TYPE.GHOST)) &&
        (objectExist(position + 1, OBJECT_TYPE.WALL) || objectExist(position + 1, OBJECT_TYPE.GHOST)) &&
        (objectExist(position - GRID_SIZE, OBJECT_TYPE.WALL) || objectExist(position - GRID_SIZE, OBJECT_TYPE.GHOST)) &&
        (objectExist(position + GRID_SIZE, OBJECT_TYPE.WALL) || objectExist(position + GRID_SIZE, OBJECT_TYPE.GHOST))
    ) { 
        return { nextMovePos: position, direction };
    }

    let ghost_pos = coordsFromPos(position);
    const keys = Object.keys(DIRECTIONS);
    let key = null;
    if (auto_path[0] === ghost_pos[0] && auto_path[1] > ghost_pos[1]) {
        key = keys[2];
    } else if (auto_path[0] === ghost_pos[0] && auto_path[1] < ghost_pos[1]) {
        key = keys[0];
    } else if (auto_path[0] > ghost_pos[0] && auto_path[1] === ghost_pos[1]) {
        key = keys[3];
    } else if (auto_path[0] < ghost_pos[0] && auto_path[1] === ghost_pos[1]) {
        key = keys[1];
    }


    let dir = DIRECTIONS[key];
    return { nextMovePos: auto_path[0] * GRID_SIZE + auto_path[1], direction: dir };
}

