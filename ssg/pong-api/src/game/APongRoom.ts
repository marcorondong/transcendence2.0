import { SessionRoom } from "../utils/SessionRoom";
import { APongGame, EGameStatus } from "./modes/APongGame";
import { IPongFrameSingles} from "./modes/singles/PongGameSingles";
import { EPlayerRoleFiltered, PongPlayer, EPlayerStatus, ETeamSideFiltered, ETeamSide} from "./PongPlayer";
import { WebSocket, RawData } from "ws";
import { Paddle } from "./elements/Paddle";
import { Parser } from "../utils/Parser";
import { RoomEvents } from "../customEvents";
import { ClientEvents } from "../customEvents";
import raf from "raf";
import { IPongFrameDoubles } from "./modes/doubles/PongGameDoubles";

enum EPongRoomState
{
	LOBBY,
	GAME
}

export abstract class APongRoom<T extends APongGame> extends SessionRoom
{
	protected game: T;
	protected isCleaned: boolean;
	protected isFrameGenerating: boolean;
	protected matchName: string;
	protected readonly privateRoom: boolean;
	protected roomState: EPongRoomState


	abstract broadcastLobbyUpdate(extraInfo: string): void;
	abstract updateOthers(message: string): void;
	abstract isFull(): boolean;
	abstract isEmpty(): boolean;
	abstract getMissingPlayerRole(): EPlayerRoleFiltered;
	abstract setMissingPlayer(player: PongPlayer): void
	abstract removePlayer(player: PongPlayer): void;
	abstract getLeftCaptain(): PongPlayer;
	abstract getRightCaptain(): PongPlayer;
	abstract getGameFrame(): any;
	abstract calculateMissingPlayers(): number
	
	constructor(privateRoom: boolean, match: T)
	{
		super();
		this.game = match;
		this.isCleaned = false;
		this.isFrameGenerating = false;
		this.matchName = "Unknown match";
		this.privateRoom = privateRoom;
		this.roomState = EPongRoomState.LOBBY;
	}
	
	static createMatchStatusUpdate(notification: string)
	{
		return {
			matchStatus: notification
		}
	}

	getRoomIdJSON()
	{
		return{
			roomId: this.getId()
		}
	}

	async getRoomWinner(): Promise<PongPlayer>
	{
		const winnerSide = await this.getRoomWinnerSide();
		return this.fetchWinnerCaptain(winnerSide);
	}
		
	async getRoomLoser(): Promise<PongPlayer>
	{
		const loserSide = await this.getRoomLoserSide();
		return this.fetchLoserCaptain(loserSide)
	}


	isPrivate(): boolean
	{
		return this.privateRoom;
	}

	setPongRoomState(state: EPongRoomState): void
	{
		this.roomState = state;
	}

	getAndSendFramesOnce(): void
	{
		if(this.isFrameGenerating === false)
		{
			this.isFrameGenerating = true;
			this.sendFrames();
		}
	}

	checkIfPlayerIsStillOnline(player: PongPlayer): void
	{
		if(player.getPlayerOnlineStatus() != EPlayerStatus.ONLINE)
			this.game.forfeitGame(player.getTeamSideLR());
	}

	setMatchName(roundName: string): void
	{
		this.matchName = roundName;
	}

	getMatchName(): string
	{
		return this.matchName;
	}

	getGame(): T
	{
		return this.game;
	}

	addSpectator(connection: WebSocket): void
	{
		this.addConnectionToRoom(connection);
	}

	isRoomCleaned(): boolean
	{
		return this.isCleaned;
	}

	setRoomCleanedStatus(freshStatus: boolean): void
	{
		this.isCleaned = freshStatus;
	}

	addPlayer(player: PongPlayer): void
	{
		this.setMissingPlayer(player);
		this.addConnectionToRoom(player.connection);
		this.assingControlsToPlayer(player, player.getPlayerPaddle(this.game));
		this.disconnectBehaviour(player);
		this.broadcastLobbyUpdate("Another player joined");
		if(this.isFull())
		{
			this.setPongRoomState(EPongRoomState.GAME);
			this.emit(RoomEvents.FULL, this);
		}
		else
		{
			this.sendLobbyUpdate(player, "Welcome!");
		}
	}

	sendCurrentFrame(): void
	{
		const frame: IPongFrameSingles | IPongFrameDoubles = this.getGameFrame();
		const frameWithRoomId = {...frame, roomId: this.getId(), knockoutName: this.matchName};
		const frameJson = JSON.stringify(frameWithRoomId);
		this.roomBroadcast(frameJson)
	}

	protected sendLobbyUpdate(player: PongPlayer, extraInfo: string): void
	{
		const announcement = `${extraInfo} You are player [${player.getPlayerRoleString()}] wait for ${this.calculateMissingPlayers()} more player to join`;
		const announcementJson = APongRoom.createMatchStatusUpdate(announcement);
		const roomIdJson = this.getRoomIdJSON();
		const message = JSON.stringify(
			{
				...roomIdJson,
				...announcementJson
			}
		);

		player.sendNotification(message);
	}

	private sendFrames(): void
	{
		const renderFrame = () => {
			this.sendCurrentFrame();
			if(this.getGame().getGameStatus() === EGameStatus.FINISHED)
			{
				return;
			}
			raf(renderFrame);
		};
		raf(renderFrame);
	}

	private assingControlsToPlayer(player: PongPlayer, playerPaddle: Paddle): void 
	{
		player.connection.on("message", (data: RawData, isBinary: boolean) =>
		{
			const json = Parser.rawDataToJson(data);
			if(!json)
			{
				player.connection.send("Invalid json");
				return 
			}
			const direction = json.move;
			this.getGame().movePaddle(playerPaddle, direction);
		})
	}

	private disconnectBehaviour(rageQuitPlayer: PongPlayer): void
	{
		rageQuitPlayer.on(ClientEvents.GONE_OFFLINE, (player: PongPlayer) =>
		{
			console.log("Player disconnect");
			if(this.game.getGameStatus() === EGameStatus.RUNNING)
			{
				console.log("Game was runnig. Rage quiter side lost");
				this.game.forfeitGame(player.getTeamSideLR());
			}
			else 
			{
				this.removePlayer(rageQuitPlayer);
				this.updateOthers("Someone left");
				if(this.isEmpty())
					this.emit(RoomEvents.EMPTY, this);
			}
				
		})
	}

	private async getRoomWinnerSide(): Promise<ETeamSideFiltered>
	{
		await this.game.waitForFinalWhistle();
		return this.game.getPongWinnerSide()
	}
		
	private async getRoomLoserSide(): Promise<ETeamSideFiltered>
	{
		await this.game.waitForFinalWhistle();
		return this.game.getPongLoserSide();
	}

	private fetchWinnerCaptain(winningSide: ETeamSideFiltered): PongPlayer
	{
		if(winningSide === ETeamSide.LEFT)
			return this.getLeftCaptain();
		else if(winningSide === ETeamSide.RIGTH)
			return this.getRightCaptain();
		throw new Error("Winning side undefined");
	}

	private fetchLoserCaptain(loserSide: ETeamSideFiltered): PongPlayer
	{
		if(loserSide === ETeamSide.LEFT)
			return this.getLeftCaptain();
		else if(loserSide === ETeamSide.RIGTH)
			return this.getRightCaptain();
		throw new Error("Winning side undefined");
	}
}