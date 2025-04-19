import { Pong } from "../types/Pong.ts";

export class PongComponent extends HTMLElement {
	gameState: Pong | undefined = undefined;
	wss: WebSocket | undefined = undefined;

	// VARS
	canvasWidth = 900;
	canvasHeight = 500;
	canvasWidthHalf = 0;
	canvasHeightHalf = 0;

	// CANVAS
	canvas = document.createElement("canvas");
	ctx = this.canvas.getContext("2d");

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

	gameLoop = () => {
		if (!this.ctx) return;

		const mult = this.canvasWidthHalf / 4;

		const ballX =
			this.canvasWidthHalf + (this.gameState?.ball?.x ?? 0) * mult;
		const ballY =
			this.canvasHeightHalf + (this.gameState?.ball?.y ?? 0) * mult;
		const ballRadius = (this.gameState?.ball?.radius ?? 0) * mult;
		console.log("ball radius:", ballRadius);

		// Clear the canvas
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.drawCenterLine();

		// Draw the circle
		this.ctx.beginPath();
		this.ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
		this.ctx.fillStyle = "white";
		this.ctx.fill();
		this.ctx.closePath();

		requestAnimationFrame(this.gameLoop);
	};

	constructor() {
		super();
		this.canvas.width = 900;
		this.canvas.height = 500;
		this.canvasWidthHalf = this.canvas.width / 2;
		this.canvasHeightHalf = this.canvas.height / 2;
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
			// console.log("got message");
			this.gameState = JSON.parse(event.data);
			if (this.gameState) {
				matchStatus.innerText =
					"Match Status: " + this.gameState?.matchStatus;
				roomId.innerText = "Room Id: " + this.gameState?.roomId;
				knockoutName.innerText =
					"Knockout Name: " +
					(this.gameState?.knockoutName ?? "no info");
			}

			// console.log("game State", this.gameState);
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
		console.log("you pressed down");
	}
	onKeyup(event) {
		console.log("you pressed up");
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
