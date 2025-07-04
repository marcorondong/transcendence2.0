import { EventEmitter } from "stream";
import { WebSocket, RawData } from "ws";
import { ClientEvents } from "../customEvents";
import { Paddle } from "./elements/Paddle";
import { APongGame } from "./modes/APongGame";
import { BOT_NICKNAME, JWT_VERIFY_URL } from "../config";

export enum EPlayerStatus {
	ONLINE,
	OFFLINE,
}

export enum ETeamSide {
	LEFT,
	RIGHT,
	TBD,
}

export enum EPlayerRole {
	LEFT_ONE,
	LEFT_TWO,
	RIGHT_ONE,
	RIGHT_TWO,
	TBD, //TBD to be decided
}

interface IPlayerInfo {
	id: string;
	nickname: string;
}

export type ETeamSideFiltered = Exclude<ETeamSide, ETeamSide.TBD>;
export type EPlayerRoleFiltered = Exclude<EPlayerRole, EPlayerRole.TBD>;

export class PongPlayer extends EventEmitter {
	readonly connection: WebSocket;
	readonly id: string;
	readonly nickname: string;
	private side: ETeamSide;
	private status: EPlayerStatus;
	private role: EPlayerRole;
	private roomId: string;

	constructor(socket: WebSocket, playerId: string, playerNickname: string) {
		super();
		this.id = playerId;
		this.nickname = playerNickname;
		this.connection = socket;
		this.side = ETeamSide.TBD;
		this.status = EPlayerStatus.ONLINE;
		this.role = EPlayerRole.TBD;
		this.roomId = "UNKNOWN";
		this.connectionMonitor();
	}

	static async createAuthorizedPlayer(
		cookie: string | undefined,
		connection: WebSocket,
	): Promise<PongPlayer | false> {
		const playerInfo = await authorizePlayer(cookie);
		if (playerInfo === false) {
			PongPlayer.sendErrorMessage(
				"Request JWT Token aka LOG IN before trying to play pong",
				connection,
			);
			connection.close(1008, "Unauthorized");
			return false;
		}
		const connectedPlayer: PongPlayer = new PongPlayer(
			connection,
			playerInfo.id,
			playerInfo.nickname,
		);
		return connectedPlayer;
	}

	isBot(): boolean {
		if (this.nickname === BOT_NICKNAME) return true;
		return false;
	}

	equals(otherPlayer: PongPlayer): boolean {
		if (this.connection === otherPlayer.connection) return true;
		return false;
	}

	getPlayerNickname(): string {
		return this.nickname;
	}

	getPlayerId(): string {
		return this.id;
	}

	getTeamSide(): ETeamSide {
		return this.side;
	}

	getPlayerRole(): EPlayerRoleFiltered {
		if (this.role === EPlayerRole.TBD)
			throw new Error("Fetching player role but it is not decided yet");
		return this.role;
	}

	getPlayerRoleString(): string {
		switch (this.role) {
			case EPlayerRole.LEFT_ONE:
				return "Left one";
			case EPlayerRole.RIGHT_ONE:
				return "Right one";
			case EPlayerRole.LEFT_TWO:
				return "Left two";
			case EPlayerRole.RIGHT_TWO:
				return "Right two";
			default:
				return "Unknown player role";
		}
	}

	getTeamSideLR(): ETeamSideFiltered {
		const LRside = this.side;
		if (LRside === ETeamSide.TBD)
			throw new Error("Calling function without deciding player side");
		return LRside;
	}

	setPlayerRole(role: EPlayerRoleFiltered): void {
		this.role = role;
		if (role === EPlayerRole.LEFT_ONE || role === EPlayerRole.LEFT_TWO)
			this.setTeamSide(ETeamSide.LEFT);
		else if (
			role === EPlayerRole.RIGHT_ONE ||
			role === EPlayerRole.RIGHT_TWO
		)
			this.setTeamSide(ETeamSide.RIGHT);
		else throw new Error("Unexpected player role set");
	}

	setPlayerRoom(idOfRoom: string) {
		this.roomId = idOfRoom;
	}

	getRoomOfPlayer(): string {
		return this.roomId;
	}

	getPlayerOnlineStatus(): EPlayerStatus {
		return this.status;
	}

	setPlayerStatus(status: EPlayerStatus): void {
		this.status = status;
	}

	sendNotification(notification: string): void {
		this.connection.send(notification);
	}

	getPlayerPaddle<T extends APongGame>(game: T): Paddle {
		return game.getPaddle(this.role);
	}

	sendError(errorMsg: string) {
		PongPlayer.sendErrorMessage(errorMsg, this.connection);
	}

	static sendErrorMessage(errorMsg: string, connection: WebSocket) {
		const jsonMsg = { error: errorMsg };
		connection.send(JSON.stringify(jsonMsg));
	}

	private connectionMonitor(): void {
		this.connection.on("close", () => {
			this.connection.close();
			console.log(
				"connection close event with player",
				this.getPlayerNickname(),
			);
			this.setPlayerStatus(EPlayerStatus.OFFLINE);
			this.emit(ClientEvents.GONE_OFFLINE, this);
		});
	}

	private setTeamSide(side: ETeamSideFiltered): void {
		this.side = side;
	}
}

function contactAuthService(cookie: string) {
	return fetch(JWT_VERIFY_URL, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Cookie": cookie,
		},
	});
}

async function getPlayerInfo(cookie: string): Promise<false | IPlayerInfo> {
	try {
		const response = await contactAuthService(cookie);
		if (!response.ok) {
			console.warn("Failed check. JWT token is not valid", response);
			return false;
		}
		console.log("User is authorized", response);
		const playerInfo = await response.json();
		const { id, nickname } = playerInfo;
		console.log("User full:", playerInfo);
		return { id, nickname };
	} catch (err) {
		console.error("Fetch failed, maybe auth microservice is down", err);
		return false;
	}
}

async function authorizePlayer(cookie: string | undefined) {
	if (!cookie) {
		console.log("Cookie don't exits");
		return false;
	}
	return getPlayerInfo(cookie);
}
