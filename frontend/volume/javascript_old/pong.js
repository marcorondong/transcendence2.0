// CLASS DEFINITIONS :::::::::::::::::::::::::::::::::::::::::::::::::::::::: //
class Player {
	movePaddle() {
		if (this.up && this.y + this.dy > 0) {
			this.dy -= stepSize;
		}
		if (this.down && this.y + this.dy + this.height < canvas.height) {
			this.dy += stepSize;
		}
	}
	draw() {
		ctx.fillStyle = "rgb(240 240 240)";
		ctx.fillRect(this.x, this.y + this.dy, this.width, this.height);
	}
	constructor(playerSide, playerName) {
		this.name = playerName;
		this.score = 0;
		this.up = false;
		this.down = false;
		this.height = canvas.height / 10;
		this.width = canvas.width / 100;
		if (playerSide === "left") {
			this.x = 0;
		} else {
			this.x = canvas.width - this.width;
		}
		this.y = canvas.height / 2 - this.height / 2;
		this.dy = 0;
	}
}

class Ball {
	constructor() {
		this.x = canvas.width / 2;
		this.y = 0;
		this.dx = -2;
		this.dy = 2;
		this.size = 6;
	}
	move() {
		this.x += this.dx;
		this.y += this.dy;
	}
	reset() {
		this.x = canvas.width / 2;
		this.y = 0;
	}
	draw() {
		ctx.fillStyle = "rgb(240 240 240)";
		ctx.fillRect(ball.x, ball.y, ball.size, ball.size);
	}
	collisionDetection() {
		// WALL BOTTOM
		if (this.y + this.size >= canvas.height) {
			this.dy *= -1;
		}

		// WALL TOP
		if (this.y <= 0) {
			this.dy *= -1;
		}

		// PADDLE LEFT
		if (
			this.x <= playerLeft.width &&
			this.y >= playerLeft.y + playerLeft.dy &&
			this.y <= playerLeft.y + playerLeft.height + playerLeft.dy
		) {
			this.dx *= -1;
		}

		// PADDLE RIGHT
		if (
			this.x + this.size >= canvas.width - playerRight.width &&
			this.y >= playerRight.y + playerRight.dy &&
			this.y <= playerRight.y + playerRight.height + playerRight.dy
		) {
			this.dx *= -1;
		}
	}
}

// FUNCTIONS :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //
function keyPress(k) {
	if (k.key === "s") {
		playerLeft.up = true;
	}
	if (k.key === "x") {
		playerLeft.down = true;
	}
	if (k.key === "k") {
		playerRight.up = true;
	}
	if (k.key === "m") {
		playerRight.down = true;
	}
}

function keyReleased(k) {
	if (k.key === "s") {
		playerLeft.up = false;
	}
	if (k.key === "x") {
		playerLeft.down = false;
	}
	if (k.key === "k") {
		playerRight.up = false;
	}
	if (k.key === "m") {
		playerRight.down = false;
	}
}

function drawCenterLine() {
	ctx.strokeStyle = "rgb(240 240 240)";
	ctx.setLineDash([5, 15]);
	ctx.beginPath();
	ctx.moveTo(canvas.width / 2, 0);
	ctx.lineTo(canvas.width / 2, canvas.height);
	ctx.closePath();
	ctx.stroke();
}

function resetState() {
	ball.reset();
	ball.dx = -2;
	ball.dy = 2;
}

function addScore() {
	if (ball.x < 0) {
		playerRight.score += 1;
	} else {
		playerLeft.score += 1;
	}
}

function displayScore() {
	ctx.font = "48px sans-serif";
	ctx.textAlign = "center";
	const space = canvas.width / 10;
	ctx.fillText(playerLeft.score, canvasHalf - space, 50);
	ctx.fillText(playerRight.score, canvasHalf + space, 50);
}

function gameOver() {
	isGameStarted = false;
	isGameOver = true;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font = "28px sans-serif";
	ctx.textAlign = "center";
	ctx.fillText("GAME OVER", canvasHalf, 85);
	const winner = playerLeft.score === 3 ? playerLeft.name : playerRight.name;
	ctx.fillText(`THE WINNER IS ${winner}`, canvasHalf, 150);
}

function pauseSwitch() {
	if (isGameOver){
		return ; 
	}
	isGamePaused = !isGamePaused;
	if (isGamePaused) {
		ctx.globalAlpha = 0.7;
		ctx.fillStyle = "rgb(0 0 0)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.globalAlpha = 1;
		ctx.fillStyle = "rgb(240 240 240)";
		const fontSize = 28;
		ctx.font = `${fontSize}px sans-serif`;
		ctx.textAlign = "center";
		ctx.fillText("PAUSE", canvasHalf, canvas.height / 2);
	}
}

function gameLoop() {
	if (!isGamePaused && isGameStarted) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		playerLeft.movePaddle();
		playerRight.movePaddle();
		ball.move();
		playerLeft.draw();
		playerRight.draw();
		ball.draw();
		ball.collisionDetection();
		drawCenterLine();
		displayScore();

		// SOMEBODY SCORED
		if (ball.x < 0 || ball.x > canvas.width) {
			addScore();
			resetState();
		}
		if (playerLeft.score === 3 || playerRight.score === 3) {
			gameOver();
		}
		if (isGameOver){
			return 
		}
	}
	// recursively calling gameLoop
	requestAnimationFrame(gameLoop);
}

export function runGame() {
	if (ctx) {
		gameLoop();
	} else {
		console.log("your browser doesn't support the canvas element");
	}
}

// GLOBAL VARIABLES ::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //
const canvas = document.getElementById("canvas");
const buttonStart = document.getElementById("button-start");
const buttonPause = document.getElementById("button-pause");
// const buttonSubmit = document.getElementById("button-submit");
const canvasHalf = canvas.getContext ? canvas.width / 2 : undefined;
const ctx = canvas.getContext ? canvas.getContext("2d") : undefined;
let stepSize = 3;
let isGamePaused = false;
let isGameStarted = false;
let isGameOver = true;

// EVENT LISTENERS :::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //
document.addEventListener("keydown", keyPress, false);

document.addEventListener("keyup", keyReleased, false);

buttonStart.addEventListener("click", () => {
	if (isGameStarted){
		return 
	}
	isGameOver = false;
	isGameStarted = true;
	playerLeft.score = 0;
	playerRight.score = 0;
	runGame();
});

// buttonSubmit.addEventListener("click", () => {
// 	playerLeft.name = document.getElementById("player-name").value;
// });

buttonPause.addEventListener("click", pauseSwitch);

document.addEventListener("click", (e) => {
    const target = e.target;
    if (!target.matches("nav a") || isGamePaused) {
        return;
    }
	pauseSwitch();
});

// OBJECTS :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //
const playerLeft = new Player("left", "player A");
const playerRight = new Player("right", "player B");
const ball = new Ball();

// ENTRYPOINT TO GAME ::::::::::::::::::::::::::::::::::::::::::::::::::::::: //
// runGame();
