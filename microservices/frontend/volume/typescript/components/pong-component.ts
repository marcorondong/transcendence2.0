import { Ball, Paddle, Pong } from "../types/Pong";
import { ChatComponent } from "./chat-component.js";
import { IconComponent } from "./icon-component.js";
import { printMessage } from "./pong-utils.js";

export class PongComponent extends HTMLElement {
	gameState: Pong | undefined = undefined;
	wss: WebSocket | undefined = undefined;
	canvas = document.createElement("canvas");
	ctx = this.canvas.getContext("2d");
	chat: ChatComponent;
	botJoined: boolean | undefined = undefined;

	// VARS
	aspectRatio = 16 / 9;
	canvasToWindow = 0.6;
	canvasWidth: number = 0;
	paddleDirection = 0;
	canvasHeight: number = 0;
	canvasWidthHalf: number = 0;
	canvasHeightHalf: number = 0;
	scaleX: number = 0;
	scaleY: number = 0;
	paddleWidth: number = 0;

	// Buttons
	fullscreenButton = document.createElement("button");

	createNewWebsocket() {
		// const queryParams = window.location.search;
		let url = `wss://${window.location.hostname}:${window.location.port}/pong-api/pong/`;

		this.wss?.close();

		console.log("roomId", this.chat.roomId);
		if (this.chat.roomId) {
			url = this.urlFromRoomId(url);
		}
		if (this.chat.gameSelection) {
			url = this.urlFromGameSelection(url);
		}

		console.log("ws to: ", url);
		this.wss = new WebSocket(url);
	}

	urlFromGameSelection(url: string) {
		const selection = this.chat.gameSelection;
		if (!selection) {
			return url;
		}
		url += selection.modeSelection;
		if (selection.playSelection === "public") {
			return url;
		}
		if (
			selection.modeSelection === "singles" ||
			selection.modeSelection === "doubles"
		) {
			url += "?roomId=private";
		}
		if (selection.modeSelection === "tournament") {
			url += "?tournamentSize=" + selection.playSelection;
		}
		return url;
	}

	urlFromRoomId(url: string) {
		url += "singles?roomId=" + this.chat.roomId;
		if (this.chat.roomId !== "private") {
			this.chat.roomId = undefined;
		}
		return url;
	}

	adjustCanvasToWindow() {
		const windowWidth = window.innerWidth;
		if (windowWidth < 640) {
			this.canvasToWindow = 0.9;
		}
		if (windowWidth >= 640 && windowWidth < 1024) {
			this.canvasToWindow = 0.75;
		}
		if (windowWidth >= 1024) {
			this.canvasToWindow = 0.6;
		}
		this.canvasWidth = window.innerWidth * this.canvasToWindow;
		this.adjustToCanvasWidth();
		if (this.canvas) {
			this.canvas.width = this.canvasWidth;
			this.canvas.height = this.canvasHeight;
		}
	}

	goFullscreen() {
		if (this.canvas.requestFullscreen) {
			this.canvas.requestFullscreen();
		}
	}

	adjustToCanvasWidth() {
		this.canvasHeight = this.canvasWidth / this.aspectRatio;
		this.canvasWidthHalf = this.canvasWidth / 2;
		this.canvasHeightHalf = this.canvasHeight / 2;
		this.scaleX = this.canvasWidthHalf / 4;
		this.scaleY = this.canvasHeightHalf / 2.46;
		this.paddleWidth = this.canvasWidth / 100;
	}

	scaleGameState(state: Pong) {
		if (state?.ball) {
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
					//paddle: "left",
				}),
			);
		}
	}
	displayScore(state: Pong) {
		if (!this.ctx) {
			return;
		}
		const fontSize = Math.trunc(this.canvasHeight / 8);
		this.ctx.font = `${fontSize}px sans-serif`;
		this.ctx.textAlign = "center";
		const space = this.canvas.width / 10;
		this.ctx.fillText(
			String(state.score?.leftTeam.goals ?? 0),
			this.canvasWidthHalf - space,
			fontSize * 1.2,
		);
		this.ctx.fillText(
			String(state.score?.rightTeam.goals ?? 0),
			this.canvasWidthHalf + space,
			fontSize * 1.2,
		);
	}

	gameLoop = () => {
		if (!this.ctx) return;

		// CLEAR THE CANVAS
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		if (this.gameState && this.gameState.ball) {
			const state = structuredClone(this.gameState);
			this.scaleGameState(state);
			this.drawCenterLine();
			this.drawPaddle(state.leftPaddle);
			this.drawPaddle(state.rightPaddle);
			this.drawBall(state.ball);
			this.displayScore(state);
			this.sendPaddleState();
			if (state.matchStatus === "Game finished") {
				printMessage(
					"Game Over",
					this.ctx,
					this.canvasWidth,
					this.canvasHeight,
				);
				return;
			}
		} else {
			this.drawCenterLine();
			printMessage(
				"Waiting for Opponent...",
				this.ctx,
				this.canvasWidth,
				this.canvasHeight,
			);
		}

		requestAnimationFrame(this.gameLoop);
	};

	async requestBot(roomId: string) {
		const url = `https://${window.location.hostname}:${window.location.port}/ai-api/game-mandatory`;
		const reqBody = JSON.stringify({
			roomId: roomId,
			difficulty: this.chat.gameSelection?.playSelection,
		});

		try {
			const response = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: reqBody,
			});
			this.botJoined = response.ok;
		} catch (error) {
			console.error("Exception in requestBot:", error);
			this.botJoined = false;
		}

		if (this.botJoined === false) {
			console.error("Bot is offline. Try again later."); // will improve error msg, in a different branch
		}
	}

	constructor(chat: ChatComponent) {
		super();
		this.adjustCanvasToWindow();
		this.chat = chat;
	}

	connectedCallback() {
		console.log("Pong CONNECTED");
		console.log("gamed State", this.chat.gameSelection);

		this.classList.add("shrink-0", "w-fit");
		const canvasContainer = document.createElement("div");
		canvasContainer.classList.add(
			"p-1",
			"sm:p-3",
			"xl:p-5",
			"mb-10",
			"sm:border-5",
			"xl:border-6",
			"border-3",
			"sm:rounded-xl",
			"rounded-lg",
			"bg-indigo-950",
			"border-cyan-300",
			"glow",
			"shrink-0",
			"w-fit",
			"relative",
			"group",
		);

		this.canvas.classList.add("bg-black", "rounded-lg");
		canvasContainer.appendChild(this.canvas);

		this.append(canvasContainer);

		document.addEventListener("keydown", this, false);
		document.addEventListener("keyup", this, false);
		document.addEventListener("game-data", this);
		window.addEventListener("resize", this);
		this.canvas.addEventListener("touchstart", this);
		this.canvas.addEventListener("touchend", this);

		const gameDataContainer = document.createElement("div");
		gameDataContainer.classList.add(
			"text-[5px]",
			"sm:text-xs",
			"md:text-sm",
			"lg:text:md",
		);
		const matchStatus = document.createElement("div");
		const roomId = document.createElement("div");
		const knockoutName = document.createElement("div");
		gameDataContainer.append(matchStatus, roomId, knockoutName);

		this.fullscreenButton.addEventListener("click", () => {
			this.goFullscreen();
		});

		this.fullscreenButton.id = "fullscreen-button";
		this.fullscreenButton.classList.add(
			"top-3",
			"right-3",
			"md:top-5",
			"md:right-5",
			"lg:top-8",
			"lg:right-8",
			"invisible",
			"absolute",
			"opacity-60",
			"group-hover:visible",
			"pong-button",
			"pong-button-pale",
			"touch-visible",
		);
		const fullscreenIcon = new IconComponent("fullscreen", 7);
		fullscreenIcon.id = "fullscreen-icon";
		this.fullscreenButton.appendChild(fullscreenIcon);
		canvasContainer.appendChild(this.fullscreenButton);

		this.append(gameDataContainer);

		this.createNewWebsocket();

		if (!this.wss) {
			return;
		}

		this.wss.onmessage = (event) => {
			this.gameState = JSON.parse(event.data);
			// console.log("game data from pong", event.data);
			if (this.chat.roomId) {
				this.chat.roomId = undefined;
				this.chat.sendInvitation();
			}
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
		this.botWrapper();
	}

	botWrapper() {
		if (this.isBotNeeded() === true) {
			let intervalId = setInterval(() => {
				if (
					this.wss?.readyState === this.wss?.OPEN &&
					this.gameState?.roomId
				) {
					console.log("got roomId:", this.gameState.roomId);
					clearInterval(intervalId);
					this.requestBot(this.gameState.roomId);
				} else {
					console.log("waiting for roomId...");
				}
			}, 1000);
		}
	}

	isBotNeeded() {
		return (
			this.chat.gameSelection?.playSelection === "easy" ||
			this.chat.gameSelection?.playSelection === "normal" ||
			this.chat.gameSelection?.playSelection === "hard"
		);
	}

	handleEvent(event: Event) {
		const handlerName =
			"on" + event.type.charAt(0).toUpperCase() + event.type.slice(1);
		const handler = this[handlerName as keyof this];
		if (typeof handler === "function") {
			handler.call(this, event);
		}
	}

	onTouchstart(event: TouchEvent) {
		const touch = event.touches[0];
		const rect = this.canvas.getBoundingClientRect();
		const y = touch.clientY - rect.top;
		console.log("y:", y);
		let halfPoint: number;
		if (document.fullscreenElement) {
			halfPoint = window.innerHeight / 2;
		} else {
			halfPoint = this.canvasHeightHalf;
		}

		if (y < halfPoint) {
			this.paddleDirection = -1;
		} else {
			this.paddleDirection = 1;
		}
	}

	onTouchend(event: TouchEvent) {
		this.paddleDirection = 0;
	}

	onKeydown(event: KeyboardEvent) {
		if (event.key === "ArrowUp" || event.key === "ArrowDown") {
			event.preventDefault();
		}
		if (event.key === "ArrowUp") this.paddleDirection = -1;
		if (event.key === "ArrowDown") this.paddleDirection = 1;
	}

	onKeyup(event: KeyboardEvent) {
		if (event.key === "ArrowUp" || event.key === "ArrowDown") {
			event.preventDefault();
		}
		if (event.key === "ArrowUp" || event.key === "ArrowDown")
			this.paddleDirection = 0;
	}
	onClick(event: MouseEvent) {}

	onResize() {
		this.adjustCanvasToWindow();
	}

	disconnectedCallback() {
		console.log("Pong DISCONNECTED");
		this.wss?.close();
		document.removeEventListener("keydown", this, false);
		document.removeEventListener("keyup", this, false);
		document.removeEventListener("click", this, false);
	}
}

customElements.define("pong-component", PongComponent);
