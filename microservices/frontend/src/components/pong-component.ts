import { baseUrl } from "../services/fetch";
import type { PongQueryParams } from "../types/Fetch";
import { BotModes } from "../types/Game";
import type { BotMode } from "../types/Game";
import type { Ball, Paddle, Pong } from "../types/Pong";
import { ChatComponent } from "./chat-component";
import { IconComponent } from "./icon-component";
import { printMessage } from "./pong-utils";

export class PongComponent extends HTMLElement {
	gameState: Pong | undefined = undefined;
	wss: WebSocket | undefined = undefined;
	canvas = document.createElement("canvas");
	ctx = this.canvas.getContext("2d");
	chat: ChatComponent;
	pongQueryParams: PongQueryParams;
	botJoined: boolean | undefined = undefined;
	lobbyMessage: string = "Waiting for Opponent...";

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

	constructor(chat: ChatComponent, pongQueryParams: PongQueryParams) {
		super();
		this.adjustCanvasToWindow();
		this.chat = chat;
		this.pongQueryParams = pongQueryParams;
	}

	connectedCallback() {
		// CANVAS ELEMENT
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

		// FULLSCREEN BUTTON
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

		// COPY ROOM ID BUTTON - MAKES MORE SENSE FOR PRIVATE + SPECTATE MODE
		if (
			this.pongQueryParams.room === "private" ||
			this.pongQueryParams.room === "spectate"
		) {
			this.appendCopyLink("roomId");
		}

		// COPY LINK BUTTON FOR PRIVATE ROOMS
		if (this.pongQueryParams.room === "private") {
			this.appendCopyLink("link");
		}

		// EVENT LISTENER
		document.addEventListener("keydown", this, false);
		document.addEventListener("keyup", this, false);
		document.addEventListener("game-data", this);
		document.addEventListener("click", this);
		window.addEventListener("resize", this);
		this.canvas.addEventListener("touchstart", this);
		this.canvas.addEventListener("touchend", this);
		this.fullscreenButton.addEventListener("click", () => {
			this.goFullscreen();
		});

		this.createNewWebsocket();

		if (!this.wss) {
			return;
		}

		this.wss.onmessage = (event) => {
			this.gameState = JSON.parse(event.data);
			if (this.chat.roomId) {
				this.chat.roomId = undefined;
				this.chat.sendInvitation();
			}
			if (this.gameState?.roomId || !this.gameState?.score) {
				this.fillCopyContainers();
			}
		};
		this.wss.onclose = () => {
			this.lobbyMessage = "Disconnected. Try again later.";
		};
		this.gameLoop();
		this.botWrapper();
	}

	fillCopyContainers() {
		if (this.pongQueryParams.room === "private") {
			const link = document.getElementById("copy-link") as HTMLElement;
			if (link && this.gameState) {
				link.innerText =
					baseUrl +
					"/pong-view?mode=singles&room=" +
					this.gameState.roomId;
			}
		}

		// COPY ROOM ID BUTTON - MAKES MORE SENSE FOR PRIVATE + SPECTATE MODE
		const roomIdDiv = document.getElementById("copy-roomId") as HTMLElement;
		if (roomIdDiv && this.gameState) {
			roomIdDiv.innerText = this.gameState.roomId;
		}
	}

	disconnectedCallback() {
		this.wss?.close();
		document.removeEventListener("keydown", this, false);
		document.removeEventListener("keyup", this, false);
		document.removeEventListener("click", this, false);
	}

	copyToClipboard(id: string) {
		// Get the text field
		var copyText = document.getElementById(id);

		// Copy the text inside the text field
		if (copyText) {
			navigator.clipboard.writeText(copyText?.innerText);
		}
	}

	appendCopyLink(inviteType: "link" | "roomId") {
		const headline = document.createElement("h2");
		headline.classList.add("pong-heading", "text-center", "mb-2");
		headline.innerText = `Share this ${inviteType} to invite`;
		const linkContainer = document.createElement("div");
		linkContainer.classList.add(
			"pong-card",
			"pong-card-dark",
			"flex",
			"gap-8",
			"px-4",
			"py-2",
			"items-center",
			"justify-between",
		);
		const copyIcon = new IconComponent("copy", 4);
		const copyButton = document.createElement("button");
		copyButton.classList.add("pong-button", "pong-button-primary");
		copyButton.id = `copy-${inviteType}-button`;
		copyButton.append(copyIcon);
		const link = document.createElement("div");
		link.classList.add("text-xs");
		link.id = `copy-${inviteType}`;
		linkContainer.append(link, copyButton);
		this.append(headline, linkContainer);
	}

	websocketUrl(): string {
		console.log("pongQueryParams:", this.pongQueryParams);
		// let url = `wss://${window.location.hostname}:${window.location.port}/pong-api/pong/`;
		let url = import.meta.env.PROD
			? `wss://${window.location.hostname}:${window.location.port}/pong-api/pong/`
			: `ws://${window.location.hostname}:${window.location.port}/pong-api/pong/`;
		if (this.pongQueryParams.mode) {
			url += this.pongQueryParams.mode;
		}
		if (
			!this.pongQueryParams.room ||
			this.pongQueryParams.room === "public" ||
			this.isBotNeeded()
		) {
			return url;
		}
		if (this.pongQueryParams.mode === "spectate") {
			url += "/" + this.pongQueryParams.room;
			return url;
		}
		if (this.pongQueryParams.room) {
			url += "?";
		}
		if (this.pongQueryParams.mode === "tournament") {
			url += "tournamentSize=" + this.pongQueryParams.room;
			return url;
		}
		url += `roomId=${this.pongQueryParams.room}`;
		return url;
	}

	createNewWebsocket() {
		this.wss?.close();
		const url = this.websocketUrl();
		this.wss = new WebSocket(url);
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
				this.lobbyMessage,
				this.ctx,
				this.canvasWidth,
				this.canvasHeight,
			);
		}

		requestAnimationFrame(this.gameLoop);
	};

	async requestBot(roomId: string) {
		const url = `https://${window.location.hostname}:${window.location.port}/ai-api/game-mandatory`;
		console.log(roomId);
		const reqBody = JSON.stringify({
			roomId: roomId,
			difficulty: this.pongQueryParams.room,
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
			this.lobbyMessage = "Bot is offline. Try again later.";
		}
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
		const botMode = BotModes.includes(this.pongQueryParams.room as BotMode);
		console.log("botMode:", botMode);
		return botMode;
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

	onTouchend() {
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
	onClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target) {
			return;
		}
		const button = target.closest("button");
		if (button) {
			this.handleCopyButton(button);
		}
	}
	handleCopyButton(button: HTMLButtonElement) {
		if (!button.id.startsWith("copy-") || !button.id.endsWith("-button")) {
			return;
		}
		this.copyToClipboard(button.id.replace("-button", ""));
	}

	onResize() {
		this.adjustCanvasToWindow();
	}
}

customElements.define("pong-component", PongComponent);
