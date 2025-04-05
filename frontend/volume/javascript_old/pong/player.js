"use strict";

export class Player {
    movePaddle() {
        if (this.up && this.y + this.dy > 0) {
            this.dy -= this.gameData.stepSize;
        }
        if (
            this.down &&
            this.y + this.dy + this.height < this.gameData.canvasHeight
        ) {
            this.dy += this.gameData.stepSize;
        }
    }
    draw() {
        this.gameData.ctx.fillStyle = "rgb(240 240 240)";
        this.gameData.ctx.fillRect(
            this.x,
            this.y + this.dy,
            this.width,
            this.height
        );
    }
    constructor(playerSide, playerName, gameData) {
        this.gameData = gameData;
        this.name = playerName;
        this.score = 0;
        this.up = false;
        this.down = false;
        this.height = this.gameData.canvasHeight / 10;
        this.width = this.gameData.canvasWidth / 100;
        this.x = 0;
        if (playerSide === "left") {
            this.x = 0;
        } else {
            this.x = this.gameData.canvasWidth - this.width;
        }
        this.y = this.gameData.canvasHeight / 2.0 - this.height / 2.0;
        this.dy = 0;
    }
}
