import { DIRECTIONS, OBJECT_TYPE, GRID_SIZE } from "./setup.js";

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

