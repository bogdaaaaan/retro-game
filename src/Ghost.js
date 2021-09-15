import { DIRECTIONS, OBJECT_TYPE, GRID_SIZE } from './setup.js';

export default class Ghost {
    constructor(speed = 5, startPos, movement, name) {
        this.name = name;
        this.movement = movement;
        this.startPos = startPos;
        this.pos = startPos;
        this.dir = DIRECTIONS.ArrowRight;
        this.speed = speed;
        this.startSpeed = speed;
        this.timer = 0;
        this.isScared = false;
        this.isAlerted = false;
        this.rotation = false;
    }

    getCoordinates() {
        return [(this.pos - (this.pos % GRID_SIZE)) / GRID_SIZE, this.pos % GRID_SIZE];
    }

    shouldMove() {
        if (this.timer === this.speed) {
            this.timer = 0;
            return true;
        }
        this.timer++;
        return false;
    }

    getNextMove(objectExist) {
        const { nextMovePos, direction } = this.movement(
            this.pos,
            this.dir,
            objectExist
        );

        return { nextMovePos, direction };
    }

    makeMove() {
        const classesToRemove = [
            OBJECT_TYPE.GHOST,
            OBJECT_TYPE.SCARED,
            OBJECT_TYPE.ALERTED,
            this.name,
        ];
        let classesToAdd = [OBJECT_TYPE.GHOST, this.name];

        if (this.isScared) {
            classesToAdd = [...classesToAdd, OBJECT_TYPE.SCARED];
            this.speed = this.startSpeed + 2;
        } else {
            this.speed = this.startSpeed;
        }
        if (this.isAlerted)
            classesToAdd = [...classesToAdd, OBJECT_TYPE.ALERTED];

        return { classesToRemove, classesToAdd };
    }

    setNewPos(nextMovePos, direction) {
        this.pos = nextMovePos;
        this.dir = direction;
    }
}
