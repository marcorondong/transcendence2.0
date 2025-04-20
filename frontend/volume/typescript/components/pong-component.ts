import { Ball, Paddle, Pong } from "../types/Pong.ts";

export class PongComponent extends HTMLElement {
	gameState: Pong | undefined = undefined;
	wss: WebSocket | undefined = undefined;

	// VARS
	aspectRatio = 16 / 9;
	canvasWidth = 800;
	paddleDirection = 0;
	canvasHeight: Number;
	canvasWidthHalf: Number;
	canvasHeightHalf: Number;

	adjustToCanvasWidth() {
		this.canvasHeight = this.canvasWidth / this.aspectRatio;
		canvasWidthHalf = this.canvasWidth / 2;
		canvasHeightHalf = this.canvasHeight / 2;
		scaleX = this.canvasWidthHalf / 4;
		scaleY = this.canvasHeightHalf / 2.46;
		paddleWidth = this.canvasWidth / 100;
	}

	// CANVAS
	canvas = document.createElement("canvas");
	ctx = this.canvas.getContext("2d");

	scaleGameState(state: Pong) {
		if (state?.ball) {
			console.log("ball Y", state.ball.y);
			state.ball.x *= this.scaleX;
			state.ball.y *= this.scaleY;
			state.ball.radius *= this.scaleX;
		}
		if (state?.leftPaddle) {
			state.leftPaddle.x *= this.scaleX;
			state.leftPaddle.y *= this.scaleY;
			state.leftPaddle.height *= this.scaleY;
		}
		if (state?.rightPaddle) {
			state.rightPaddle.x *= this.scaleX;
			state.rightPaddle.y *= this.scaleY;
			state.rightPaddle.height *= this.scaleY;
		}
	}

	drawCenterLine() {
		if (!this.ctx) {
			return;
		}
		this.ctx.strokeStyle = "rgb(240 240 240)";
		this.ctx.setLineDash([5, 15]);
		this.ctx.beginPath();
		this.ctx.moveTo(this.canvasWidthHalf, 0);
		this.ctx.lineTo(this.canvasWidthHalf, this.canvas.height);
		this.ctx.closePath();
		this.ctx.stroke();
	}

	drawPaddle(paddle: Paddle | undefined) {
		if (!this.ctx || !paddle) {
			return;
		}
		// SETTING X FOR LEFT OR RIGHT PADDLE
		let x: number = paddle.x + this.canvasWidthHalf;
		if (x > 1) {
			x -= this.paddleWidth;
		}
		this.ctx.fillStyle = "white";
		this.ctx.fillRect(
			x,
			-paddle.y + this.canvasHeightHalf - paddle.height / 2,
			this.paddleWidth,
			paddle.height,
		);
	}

	drawBall(ball: Ball | undefined) {
		if (!this.ctx || !ball) {
			return;
		}
		this.ctx.fillStyle = "white";
		this.ctx.beginPath();
		this.ctx.arc(
			ball.x + this.canvasWidthHalf,
			-ball.y + this.canvasHeightHalf,
			ball.radius,
			0,
			Math.PI * 2,
		);
		this.ctx.fill();
	}

	sendPaddleState() {
		if (this.paddleDirection !== 0 && this.wss) {
			this.wss.send(
				JSON.stringify({
					move: this.paddleDirection > 0 ? "down" : "up",
					paddle: "left",
				}),
			);
		}
	}
	displayScore(state: Pong) {
		if (!this.ctx) {
			return;
		}
		this.ctx.font = "48px sans-serif";
		this.ctx.textAlign = "center";
		const space = this.canvas.width / 10;
		this.ctx.fillText(
			String(state.score?.leftGoals ?? 0),
			this.canvasWidthHalf - space,
			50,
		);
		this.ctx.fillText(
			String(state.score?.rightGoals ?? 0),
			this.canvasWidthHalf + space,
			50,
		);
	}

	gameLoop = () => {
		if (!this.ctx) return;

		// CLEAR THE CANVAS
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		if (this.gameState) {
			const state = structuredClone(this.gameState);
			this.scaleGameState(state);
			this.drawCenterLine();
			this.drawPaddle(state.leftPaddle);
			this.drawPaddle(state.rightPaddle);
			this.drawBall(state.ball);
			this.displayScore(state);
			this.sendPaddleState();
			if (state.matchStatus === "Game finished") {
				return;
			}
		}

		requestAnimationFrame(this.gameLoop);
	};

	constructor() {
		super();
		this.canvas.width = this.canvasWidth;
		this.canvas.height = this.canvasHeight;
	}

	connectedCallback() {
		console.log("Pong CONNECTED");

		this.canvas.classList.add("bg-black");

		this.append(this.canvas);

		document.addEventListener("keydown", this, false);
		document.addEventListener("keyup", this, false);
		document.addEventListener("click", this);

		const gameDataContainer = document.createElement("div");
		const matchStatus = document.createElement("div");
		const roomId = document.createElement("div");
		const knockoutName = document.createElement("div");
		gameDataContainer.append(matchStatus, roomId, knockoutName);

		this.append(gameDataContainer);
		const queryParams = window.location.search;
		this.wss = new WebSocket(
			`wss://${window.location.hostname}:${window.location.port}/pong/${queryParams}`,
		);

		this.wss.onmessage = (event) => {
			this.gameState = JSON.parse(event.data);
			if (this.gameState) {
				matchStatus.innerText =
					"Match Status: " + this.gameState?.matchStatus;
				roomId.innerText = "Room Id: " + this.gameState?.roomId;
				knockoutName.innerText =
					"Knockout Name: " +
					(this.gameState?.knockoutName ?? "no info");
			}
		};
		this.gameLoop();
	}

	handleEvent(event: Event) {
		const handlerName =
			"on" + event.type.charAt(0).toUpperCase() + event.type.slice(1);
		const handler = this[handlerName as keyof this];
		if (typeof handler === "function") {
			handler.call(this, event);
		}
	}

	onKeydown(event) {
		if (event.key === "ArrowUp" || event.key === "ArrowDown") {
			event.preventDefault();
		}
		if (event.key === "ArrowUp") this.paddleDirection = -1;
		if (event.key === "ArrowDown") this.paddleDirection = 1;
	}
	onKeyup(event) {
		if (event.key === "ArrowUp" || event.key === "ArrowDown") {
			event.preventDefault();
		}
		event.preventDefault();
		if (event.key === "ArrowUp" || event.key === "ArrowDown")
			this.paddleDirection = 0;
	}
	onClick(event) {
		// if(event.target.id === 'start'){
		// 	this.pong.startGame();
		// }
		// if(event.target.id === 'pause'){
		// 	this.pong.pauseGame();
		// }
	}

	disconnectedCallback() {
		console.log("Pong DISCONNECTED");
		document.removeEventListener("keydown", this, false);
		document.removeEventListener("keyup", this, false);
		this.removeEventListener("click", this);
	}
}

customElements.define("pong-component", PongComponent);
