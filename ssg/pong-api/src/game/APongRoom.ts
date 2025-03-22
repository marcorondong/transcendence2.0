import { SessionRoom } from "../../../utils/SessionRoom";
import { PongGame, EGameStatus, IPongFrame} from "./modes/singles/PongGame";
import { EPlayerRoleFiltered, PongPlayer, EPlayerStatus} from "./PongPlayer";
import { WebSocket, RawData } from "ws";
import { Paddle } from "./elements/Paddle";
import { Parser } from "../../../utils/Parser";
import { RoomEvents } from "../customEvents";
import { ClientEvents } from "../customEvents";

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
	abstract getRoomWinner(): Promise<PongPlayer>;
	abstract getRoomLoser(): Promise<PongPlayer>;
	abstract getAndSendFramesOnce():void;


	static createMatchStatusUpdate(nottification: string)
	{
		return {
			matchStatus: nottification
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

	protected assingControlsToPlayer(player:PongPlayer, playerPaddle: Paddle):void 
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

	public addPlayer(player: PongPlayer): void
	{
		this.setMissingPlayer(player);
		this.addConnectionToRoom(player.connection);
		this.assingControlsToPlayer(player, player.getPlayerPaddle(this.game));
		this.disconnectBehaviour(player);
		if(this.isFull())
			this.emit(RoomEvents.FULL, this);
	}

	disconnectBehaviour(rageQuitPlayer:PongPlayer)
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

}