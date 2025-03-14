import {SessionRoom} from "../../utils/SessionRoom"
import { EGameStatus, PingPongGame } from "./game/PongGame";
import { Paddle } from "./game/Paddle";
import { IPongFrame } from "./game/PongGame";
import raf from "raf";
import { WebSocket, RawData } from "ws";
import {Parser} from "../../utils/Parser";
import { EPlayerSide, EPlayerStatus, PongPlayer } from "./PongPlayer";
import { error } from "console";
import { ClientEvents, RoomEvents } from "./customEvents";


export class PongRoom extends SessionRoom
{
	private isFrameGenerating: boolean;
	private readonly requiredPlayers;
	private leftPlayer?:PongPlayer;
	private rightPlayer?:PongPlayer;
	private tournamentRoom:boolean;
	private roundName:string;
	private isCleaned:boolean;
	private game:PingPongGame;

	constructor(privateRoom:boolean = false)
	{
		super(privateRoom);
		this.isFrameGenerating = false;
		this.requiredPlayers = 2;
		this.roundName = "single Match";
		this.isCleaned = false;
		this.tournamentRoom = false;
		this.game = PingPongGame.createStandardGame();
	}

	getRoundName()
	{
		return this.roundName;
	}

	getMissingPlayerSide():EPlayerSide
	{
		if(this.leftPlayer === undefined)
			return EPlayerSide.LEFT;
		else if(this.rightPlayer === undefined)
			return EPlayerSide.RIGTH;
		throw error("Room is full, no player is missing");
	}

	static createRoomForTwoPlayers(playerOne:PongPlayer, playerTwo:PongPlayer):PongRoom
	{
		const room:PongRoom = new PongRoom();
		playerOne.setPlayerSide(EPlayerSide.LEFT);
		playerTwo.setPlayerSide(EPlayerSide.RIGTH);
		room.addPlayer(playerOne);
		room.addPlayer(playerTwo);
		return room;
	}

	setRoomAsTournament(roundName:string)
	{
		this.tournamentRoom = true;
		this.roundName = roundName;
	}

	
	async getRoomWinner():Promise<PongPlayer>
	{
		await this.game.waitForFinalWhistle();
		return this.getWinner();
	}
		
	async getRoomLoser():Promise<PongPlayer>
	{
		await this.game.waitForFinalWhistle();
		return this.getLoser();
	}
	
	getGame():PingPongGame
	{
		return this.game;
	}
	
	addPlayer(player: PongPlayer):boolean
	{
		if(player.getPlayerSideLR()=== EPlayerSide.LEFT)
		{
			if(this.leftPlayer === undefined)
				this.leftPlayer = player
			else 
			{
				console.warn(`${player.getPlayerSide()} player already exist. Cannot overwrite it`);
				return false;
			}
		}
		else if(player.getPlayerSideLR() === EPlayerSide.RIGTH)
		{
			if(this.rightPlayer === undefined)
				this.rightPlayer = player;
			else 
			{
				console.warn(`${player.getPlayerSide()} player already exist. Cannot overwrite it`);
				return false;
			}
		}
		this.addConnectionToRoom(player.connection);
		this.assingControlsToPlayer(player);
		this.disconnectBehaviour(player);
		if(this.isFull())
		{
			this.emit(RoomEvents.FULL, this);
		}
		return true;
	}
			
	addSpectator(connection:WebSocket)
	{
		this.addConnectionToRoom(connection);
	}
	
	isFull():boolean
	{
		if (this.leftPlayer !== undefined  && this.rightPlayer !== undefined)
			return true
		return false;
	}

	isRoomCleaned():boolean
	{
		return this.isCleaned;
	}

	setRoomCleanedStatus(freshStatus:boolean):void
	{
		this.isCleaned = freshStatus;
	}
			
			
	/**
	 * function that make sure frame are generated only once. This fixed performance bug
	*/
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
			this.game.forfeitGame(player.getPlayerSideLR());
	}
	
	disconnectBehaviour(rageQuitPlayer:PongPlayer)
	{
		rageQuitPlayer.on(ClientEvents.GONE_OFFLINE, (player:PongPlayer) =>
		{
			console.log("We have rage quitter here");
			//TODO: maybe just check if game status IS started
			if(this.game.getGameStatus() !== EGameStatus.NOT_STARTED && this.game.getGameStatus() !== EGameStatus.FINISHED)
			{
				console.log("Since game is rage quiter lost");
				this.game.forfeitGame(player.getPlayerSideLR());
			}
			else 
			{
				this.removePlayer(rageQuitPlayer);
				this.emit(RoomEvents.EMPTY, this);
			}
				
		})
	}
			
	isConnectionPlayer(connection:WebSocket):boolean
	{
		if(connection === this.leftPlayer?.connection || connection === this.rightPlayer?.connection)
			return true;
		return false;
	}

	public sendCurrentFrame():void
	{
		const frame: IPongFrame = this.getGame().getFrame();
		const frameWithRoomId = {...frame, roomId:this.getId(), knockoutName:this.roundName};
		const frameJson = JSON.stringify(frameWithRoomId);
		this.roomBroadcast(frameJson)
	}

	static createMatchStatusUpdate(nottification: string)
	{
		return {
			matchStatus: nottification
		}
	}

	private removePlayer(player:PongPlayer)
	{
		if(player === this.leftPlayer)
			return this.leftPlayer = undefined;
		else if(player === this.rightPlayer)
			return this.rightPlayer = undefined;
		throw error("Player was never added in this room");
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

	private getWinner():PongPlayer
	{
		if(this.game.getPongWinnerSide() === "left")
		{
			if (this.leftPlayer === undefined)
				throw error("Left player dont exist")
			return this.leftPlayer;
		}
		else 
		{
			if(this.rightPlayer === undefined)
				throw error("Right player dont exist")
			return this.rightPlayer;
		}
	}

	private getLoser():PongPlayer
	{
		if(this.game.getPongWinnerSide() === "left")
		{
			if (this.rightPlayer === undefined)
				throw error("Right player dont exist")
			return this.rightPlayer;
		}
		else 
		{
			if(this.leftPlayer === undefined)
				throw error("left player dont exist")
			return this.leftPlayer;
		}
	}

	private assingControlsToPlayer(player:PongPlayer):void 
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
			const paddle:Paddle = this.getGame().getPaddle(player.getPlayerSideLR());
			this.getGame().movePaddle(paddle, direction);
		})
	}
}