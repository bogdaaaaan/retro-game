import { OBJECT_TYPE, DIRECTIONS, GRID_SIZE } from './setup.js';

export default class Pacman {
    constructor(speed, startPos) {
        this.pos = startPos;
        this.startPos = startPos;
        this.speed = speed;
        this.dir = null;
        this.timer = 0;
        this.powerPill = false;
        this.rotation = true;
    }

    getCoordinates() {
        return [(this.pos - (this.pos % GRID_SIZE)) / GRID_SIZE, this.pos % GRID_SIZE];
    }

    shouldMove() {
        if (!this.dir) return false;
        if (this.timer === this.speed) {
            this.timer = 0;
            return true;
        }
        this.timer++;
    }

    getNextMove(objectExist) {
        let nextMovePos = this.pos + this.dir.movement;
        if (
            objectExist(nextMovePos, OBJECT_TYPE.WALL) ||
            objectExist(nextMovePos, OBJECT_TYPE.GHOSTLAIR)
        ) {
            nextMovePos = this.pos;
        }

        return { nextMovePos, direction: this.dir };
    }

    makeMove() {
        const classesToRemove = [OBJECT_TYPE.PACMAN];
        const classesToAdd = [OBJECT_TYPE.PACMAN];

        return { classesToRemove, classesToAdd };
    }

    setNewPos(nexMovePos) {
        this.pos = nexMovePos;
    }

    handleKeyInput(e, objectExist) {
        let dir;
        if (e.keyCode >= 37 && e.keyCode <= 40) {
            e.preventDefault();
            dir = DIRECTIONS[e.key];
        } else {
            return;
        }

        const nextMovePos = this.pos + dir.movement;
        if (
            objectExist(nextMovePos, OBJECT_TYPE.WALL) ||
            objectExist(nextMovePos, OBJECT_TYPE.GHOSTLAIR)
        )
            return;
        this.dir = dir;
    }
}
