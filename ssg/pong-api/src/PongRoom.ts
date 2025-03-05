import {SessionRoom} from "../../utils/SessionRoom"
import { PingPongGame } from "./PongGame";
import { Paddle } from "./Paddle";
import { PongFrameI } from "./PongGame";
import raf from "raf";
import { WebSocket, RawData } from "ws";
import {Parser} from "../../utils/Parser";
import { PongPlayer } from "./PongPlayer";



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
			this.currentPlayers++;
			return true;
		}
		console.warn("Right player already exist cannot overwrite it");
		return false;
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
			const paddle:Paddle = this.getGame().getPaddle(player.getPlayerSide());
			this.getGame().movePaddle(paddle, direction);
		})
	}

	disconnectBehaviour(rageQuitPlayer:PongPlayer)
	{
		const socket = rageQuitPlayer.connection;
		socket.on("close", () => {
			console.log("PlayerLeft");
			this.game.forfeitGame(rageQuitPlayer.getPlayerSide());
		})
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
				return;
			}
			raf(renderFrame);
		};
		raf(renderFrame);
	}
}