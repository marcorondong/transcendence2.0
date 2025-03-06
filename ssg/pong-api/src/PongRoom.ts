import {SessionRoom} from "../../utils/SessionRoom"
import { PingPongGame } from "./game/PongGame";
import { Paddle } from "./game/Paddle";
import { PongFrameI } from "./game/PongGame";
import raf from "raf";
import { WebSocket, RawData } from "ws";
import {Parser} from "../../utils/Parser";
import { PongPlayer } from "./PongPlayer";
import { error } from "console";
import { resolve } from "path";



export class PongRoom extends SessionRoom
{
	private isFrameGenerating: boolean = false;
	private readonly requiredPlayers = 2;
	private currentPlayers = 0;
	private leftPlayer?:PongPlayer;
	private rightPlayer?:PongPlayer;

	game:PingPongGame = PingPongGame.createStandardGame();
	constructor(privateRoom:boolean = false)
	{
		super(privateRoom);
	}

	static createRoomForTwoPlayers(playerOne:PongPlayer, playerTwo:PongPlayer):PongRoom
	{
		const room:PongRoom = new PongRoom();
		playerOne.setPlayerSide("left");
		playerTwo.setPlayerSide("right")
		room.addLeftPlayer(playerOne);
		room.addRightPlayer(playerTwo);
		return room;
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

	async getRoomWinner():Promise<PongPlayer>
	{
		if(this.game.getGameStatus() === "finished")
		{
			return this.getWinner();
		}
		return new Promise((resolve) => {
			this.game.once("finished game", () =>
			{
				resolve(this.getWinner())
			})
		})
	}

	async getRoomLoser():Promise<PongPlayer>
	{
		if(this.game.getGameStatus() === "finished")
		{
			return this.getLoser();
		}
		return new Promise((resolve) => {
			this.game.once("finished game", () =>
			{
				resolve(this.getLoser())
			})
		})
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
			this.currentPlayers++;
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
			this.currentPlayers++;
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
		return (this.currentPlayers === this.requiredPlayers);
	}


	/**
	 * function that make sure frame are generated only once. This fixed performance bug
	 */
	getAndSendFramesOnce() {
		if(this.isFrameGenerating === false)
		{
			this.isFrameGenerating = true;
			this.sendFrames();
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

	disconnectBehaviour(rageQuitPlayer:PongPlayer)
	{
		const socket = rageQuitPlayer.connection;
		socket.on("close", () => {
			console.log("Player quited");
			this.currentPlayers--;
			this.removeConnectionFromRoom(socket);
			if(this.currentPlayers === 1)
				this.game.forfeitGame(rageQuitPlayer.getPlayerSideLR());
		})
	}

	isConnectionPlayer(connection:WebSocket):boolean
	{
		if(connection === this.leftPlayer?.connection || connection === this.rightPlayer?.connection)
			return true;
		return false;
	}

	// addAndAssingControlsToPlayer(PongPlayer:PongPlayer, playerSide: "left" | "right")
	// {
	// 	this.addPlayer(player);
	// 	this.assingControlsToPlayer(player.connection, playerSide);
	// }

	private sendFrames()
	{
		const renderFrame = () => {
			const frame: PongFrameI = this.getGame().getFrame();
			const frameWithRoomId = {...frame, roomId:this.getId()};
			const frameJson = JSON.stringify(frameWithRoomId);
			this.roomBroadcast(frameJson)
			if(this.getGame().isLastFrame())
			{
				//TODO check this hotfix one more; it makes tournament possible
				//this.closeAndRemoveAllConnections();
				return;
			}
			raf(renderFrame);
		};
		raf(renderFrame);
	}
}