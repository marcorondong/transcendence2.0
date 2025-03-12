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
	private isFrameGenerating: boolean = false;
	private readonly requiredPlayers = 2;
	private leftPlayer?:PongPlayer;
	private rightPlayer?:PongPlayer;

	private tournamentRoom:boolean = false;
	private roundName:string ="single Match";

	isCleaned:boolean = false;

	game:PingPongGame = PingPongGame.createStandardGame();
	constructor(privateRoom:boolean = false)
	{
		super(privateRoom);
	}

	getRoundName()
	{
		return this.roundName;
	}

	static createRoomForTwoPlayers(playerOne:PongPlayer, playerTwo:PongPlayer):PongRoom
	{
		const room:PongRoom = new PongRoom();
		playerOne.setPlayerSide(EPlayerSide.LEFT);
		playerTwo.setPlayerSide(EPlayerSide.RIGTH)
		room.addLeftPlayer(playerOne);
		room.addRightPlayer(playerTwo);
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
	
	addLeftPlayer(leftPlayer: PongPlayer):boolean
	{
		if(this.leftPlayer === undefined)
		{
			this.leftPlayer = leftPlayer;
			this.addConnectionToRoom(leftPlayer.connection);
			this.assingControlsToPlayer(this.leftPlayer);
			this.disconnectBehaviour(this.leftPlayer);
			return true
		}
		console.warn("Left player already exist. Cannot overwrite it")
		return false;
	}
		
	addRightPlayer(rightPlayer:PongPlayer):boolean
	{
		if(this.rightPlayer === undefined)
		{
			this.rightPlayer = rightPlayer;
			this.addConnectionToRoom(rightPlayer.connection);
			this.assingControlsToPlayer(this.rightPlayer);
			this.disconnectBehaviour(this.rightPlayer);
			return true;
		}
		console.warn("Right player already exist cannot overwrite it");
		return false;
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