'use strict'

export class Ball {
    constructor(gameData, playerLeft, playerRight) {
		this.playerLeft = playerLeft
		this.playerRight = playerRight
        this.gameData = gameData
        this.x = this.gameData.canvasHalf
        this.y = 0
        this.dx = -2
        this.dy = 2
        this.size = 6
    }

    move() {
        this.x += this.dx
        this.y += this.dy
    }

    reset() {
        this.x = this.gameData.canvasHalf
        this.y = 0
    }

    draw() {
        this.gameData.ctx.fillStyle = 'rgb(240 240 240)'
        this.gameData.ctx.fillRect(this.x, this.y, this.size, this.size)
    }

    collisionDetection() {
        const playerLeft = this.playerLeft
		const playerRight = this.playerRight
        // WALL BOTTOM
        if (this.y + this.size >= this.gameData.canvasHeight) {
            this.dy *= -1
        }

        // WALL TOP
        if (this.y <= 0) {
            this.dy *= -1
        }

        // PADDLE LEFT
        if (
            this.x <= playerLeft.width &&
            this.y >= playerLeft.y + playerLeft.dy &&
            this.y <= playerLeft.y + playerLeft.height + playerLeft.dy
        ) {
            this.dx *= -1
        }

        // PADDLE RIGHT
        if (
            this.x + this.size >= this.gameData.canvasWidth - playerRight.width &&
            this.y >= playerRight.y + playerRight.dy &&
            this.y <= playerRight.y + playerRight.height + playerRight.dy
        ) {
            this.dx *= -1
        }
    }
}
