import { SessionRoom } from "../../../utils/SessionRoom";
import { PongGame, EGameStatus, IPongFrame} from "./modes/singles/PongGame";
import { EPlayerRoleFiltered, PongPlayer, EPlayerStatus, ETeamSideFiltered, ETeamSide} from "./PongPlayer";
import { WebSocket, RawData } from "ws";
import { Paddle } from "./elements/Paddle";
import { Parser } from "../../../utils/Parser";
import { RoomEvents } from "../customEvents";
import { ClientEvents } from "../customEvents";
import raf from "raf";
import { IPongFrameDoubles } from "./modes/doubles/PongGameDoubles";

export abstract class APongRoom<T extends PongGame> extends SessionRoom
{
	protected isFrameGenerating: boolean;
	protected isCleaned:boolean;
	protected game: T;
	protected matchName: string;

	constructor(privateRoom:boolean = false, match:T)
	{
		super(privateRoom);
		this.isFrameGenerating = false;
		this.isCleaned = false;
		this.game = match;
		this.matchName = "Unknown match"
	}
	
	abstract isFull():boolean;
	abstract getMissingPlayerRole():EPlayerRoleFiltered;
	abstract setMissingPlayer(player:PongPlayer):void
	abstract removePlayer(player:PongPlayer): void;
	abstract getLeftCaptain(): PongPlayer;
	abstract getRightCaptain(): PongPlayer;
	abstract getGameFrame(): any;


	static createMatchStatusUpdate(nottification: string)
	{
		return {
			matchStatus: nottification
		}
	}

	async getRoomWinner():Promise<PongPlayer>
	{
		const winnerSide = await this.getRoomWinnerSide();
		return this.fetchWinnerCaptain(winnerSide);
	}
		
	async getRoomLoser():Promise<PongPlayer>
	{
		const loserSide = await this.getRoomLoserSide();
		return this.fetchLoserCaptain(loserSide)
	}

	getAndSendFramesOnce()
	{
		if(this.isFrameGenerating === false)
		{
			this.isFrameGenerating = true;
			this.sendFrames();
		}
	}

	checkIfPlayerIsStillOnline(player:PongPlayer)
	{
		if(player.getPlayerOnlineStatus() != EPlayerStatus.ONLINE)
			this.game.forfeitGame(player.getTeamSideLR());
	}

	setMatchName(roundName:string)
	{
		this.matchName = roundName;
	}

	getMatchName()
	{
		return this.matchName;
	}

	getGame():T
	{
		return this.game;
	}

	addSpectator(connection:WebSocket)
	{
		this.addConnectionToRoom(connection);
	}

	isRoomCleaned():boolean
	{
		return this.isCleaned;
	}

	setRoomCleanedStatus(freshStatus:boolean):void
	{
		this.isCleaned = freshStatus;
	}

	addPlayer(player: PongPlayer): void
	{
		this.setMissingPlayer(player);
		this.addConnectionToRoom(player.connection);
		this.assingControlsToPlayer(player, player.getPlayerPaddle(this.game));
		this.disconnectBehaviour(player);
		if(this.isFull())
			this.emit(RoomEvents.FULL, this);
	}

	sendCurrentFrame():void
	{
		const frame: IPongFrame | IPongFrameDoubles = this.getGameFrame();
		const frameWithRoomId = {...frame, roomId:this.getId(), knockoutName:this.matchName};
		const frameJson = JSON.stringify(frameWithRoomId);
		this.roomBroadcast(frameJson)
	}

	private sendFrames()
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

	private assingControlsToPlayer(player:PongPlayer, playerPaddle: Paddle):void 
	{
		player.connection.on("message", (data: RawData, isBinnary:boolean) =>
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

	private disconnectBehaviour(rageQuitPlayer:PongPlayer)
	{
		rageQuitPlayer.on(ClientEvents.GONE_OFFLINE, (player:PongPlayer) =>
		{
			console.log("We have rage quitter here");
			if(this.game.getGameStatus() === EGameStatus.RUNNING)
			{
				console.log("Since game is rage quiter lost");
				this.game.forfeitGame(player.getTeamSideLR());
			}
			else 
			{
				this.removePlayer(rageQuitPlayer);
				this.emit(RoomEvents.EMPTY, this);
			}
				
		})
	}

	private async getRoomWinnerSide():Promise<ETeamSideFiltered>
	{
		await this.game.waitForFinalWhistle();
		return this.game.getPongWinnerSide()
	}
		
	private async getRoomLoserSide():Promise<ETeamSideFiltered>
	{
		await this.game.waitForFinalWhistle();
		return this.game.getPongLoserSide();
	}

	private fetchWinnerCaptain(winningSide: ETeamSideFiltered) :PongPlayer
	{
		if(winningSide === ETeamSide.LEFT)
			return this.getLeftCaptain();
		else if(winningSide === ETeamSide.RIGTH)
			return this.getRightCaptain();
		throw new Error("Winning side undefined");
	}

	private fetchLoserCaptain(loserSide: ETeamSideFiltered) :PongPlayer
	{
		if(loserSide === ETeamSide.LEFT)
			return this.getLeftCaptain();
		else if(loserSide === ETeamSide.RIGTH)
			return this.getRightCaptain();
		throw new Error("Winning side undefined");
	}
}