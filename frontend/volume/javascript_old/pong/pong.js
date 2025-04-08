'use strict'

import { Player } from './player.js'
import { Ball } from './ball.js'

export class Pong {
    constructor(canvas) {
		this.canvas = canvas
        this.gameData = {
            canvasHeight: this.canvas.height,
            canvasWidth: this.canvas.width,
            canvasHalf: this.canvas.width / 2,
            ctx: this.canvas.getContext('2d'),
            stepSize: 3,
            isGamePaused: false,
            isGameStarted: false,
            isGameOver: true,
			playerLeft: this.playerLeft,
			playerRight: this.playerRight,
        }
		this.playerLeft = new Player('left', 'player A', this.gameData)
		this.playerRight = new Player('right', 'player B', this.gameData)
		this.ball = new Ball(this.gameData, this.playerLeft, this.playerRight)
    }

    keyPress(k) {
        if (k.key === 's') {
            this.playerLeft.up = true
        }
        if (k.key === 'x') {
            this.playerLeft.down = true
        }
        if (k.key === 'k') {
            this.playerRight.up = true
        }
        if (k.key === 'm') {
            this.playerRight.down = true
        }
    }

    keyReleased(k) {
        if (k.key === 's') {
            this.playerLeft.up = false
        }
        if (k.key === 'x') {
            this.playerLeft.down = false
        }
        if (k.key === 'k') {
            this.playerRight.up = false
        }
        if (k.key === 'm') {
            this.playerRight.down = false
        }
    }

    drawCenterLine() {
        const ctx = this.gameData.ctx
        ctx.strokeStyle = 'rgb(240 240 240)'
        ctx.setLineDash([5, 15])
        ctx.beginPath()
        ctx.moveTo(this.gameData.canvasHalf, 0)
        ctx.lineTo(this.gameData.canvasHalf, this.gameData.canvasHeight)
        ctx.closePath()
        ctx.stroke()
    }

    resetBall() {
        this.ball.reset()
        this.ball.dx = -2
        this.ball.dy = 2
    }

    addScore() {
        if (this.ball.x < 0) {
            this.playerRight.score += 1
        } else {
            this.playerLeft.score += 1
        }
    }

    displayScore() {
        const ctx = this.gameData.ctx
        ctx.font = '48px sans-serif'
        ctx.textAlign = 'center'
        const space = this.gameData.canvasWidth / 10
        ctx.fillText(
            this.playerLeft.score,
            this.gameData.canvasHalf - space,
            50,
        )
        ctx.fillText(
            this.playerRight.score,
            this.gameData.canvasHalf + space,
            50,
        )
    }

    gameOver() {
        this.gameData.isGameStarted = false
        this.gameData.isGameOver = true
        this.gameData.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.gameData.ctx.font = '28px sans-serif'
        this.gameData.ctx.textAlign = 'center'
        this.gameData.ctx.fillText('GAME OVER', this.gameData.canvasHalf, 85)
        const winner =
            this.playerLeft.score === 3 ? this.playerLeft.name : this.playerRight.name
        this.gameData.ctx.fillText(`THE WINNER IS ${winner}`, this.gameData.canvasHalf, 150)
    }

    startGame() {
        if (this.gameData.isGameStarted) {
            return
        }
        this.gameData.isGameOver = false
        this.gameData.isGameStarted = true
        this.playerLeft.score = 0
        this.playerRight.score = 0
        this.runGame()
    }

	printTextCentered(message){
		console.log('trying to print: ', message);
		const ctx = this.gameData.ctx;
        ctx.globalAlpha = 1
        ctx.fillStyle = 'rgb(240 240 240)'
        const fontSize = 28
        ctx.font = `${fontSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText(message, this.gameData.canvasHalf, this.gameData.canvasHeight / 2)
	}

    pauseGame() {
        if (this.gameData.isGameOver || !this.gameData.isGameStarted) {
            return
        }

		console.log('switching pause state');

        this.gameData.isGamePaused = !this.gameData.isGamePaused
        if (this.gameData.isGamePaused) {
			const ctx = this.gameData.ctx;
            ctx.globalAlpha = 0.7
            ctx.fillStyle = 'rgb(0 0 0)'
            ctx.fillRect(0, 0, this.gameData.canvasWidth, this.gameData.canvasHeight)
			this.printTextCentered('PAUSE');
        } else {
        	requestAnimationFrame(this.animation)
		}
    }

    gameLoop() {
        // using an arrow function, because arrow functions don't have their own 'this' keyword
        // they inherit it from their surrounding context, which in this case is the Pong class
        // using a regular function here and calling it with requestAnimationFrame would result
        // in the this keyword referring to window (the global context)
        // this is because requestAnimationFrame is not a method of the Pong Class
        // by calling a function inside requestAnimationframe the this keyword
        // refers to requestAnimationFrames context which is the global context
		console.log('trying to run game')
        this.animation = () => {
			console.log('state of paused:', this.gameData.isGamePaused)
            if (!this.gameData.isGamePaused && this.gameData.isGameStarted) {
                this.gameData.ctx.clearRect(
                    0,
                    0,
                    this.gameData.canvasWidth,
                    this.gameData.canvasHeight,
                )
                this.playerLeft.movePaddle()
                this.playerRight.movePaddle()
                this.ball.move()
                this.playerLeft.draw()
                this.playerRight.draw()
                this.ball.draw()
                this.ball.collisionDetection()
                this.drawCenterLine()
                this.displayScore()

                // SOMEBODY SCORED
                if (this.ball.x < 0 || this.ball.x > this.gameData.canvasWidth) {
                	this.addScore()
                	this.resetBall()
                }

                if (this.playerLeft.score === 3 || this.playerRight.score === 3) {
                	this.gameOver()
                }
                if (this.gameData.isGameOver) {
                    return
                }
                requestAnimationFrame(this.animation)
            }
        }
        // recursively calling gameLoop
        requestAnimationFrame(this.animation)
    }

	printStart() {
			this.printTextCentered('PRESS START');
	}

    runGame() {
        if (this.gameData.ctx) {
            this.gameLoop()
        } else {
            console.log("your browser doesn't support the canvas element")
        }
    }
}
