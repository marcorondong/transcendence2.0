import { SessionRoom } from "../../../utils/SessionRoom";
import { PongGame, EGameStatus, IPongFrame} from "./modes/singles/PongGame";
import { EPlayerRoleFiltered, PongPlayer, EPlayerStatus} from "./PongPlayer";
import { WebSocket, RawData } from "ws";
import { Paddle } from "./elements/Paddle";
import { Parser } from "../../../utils/Parser";
import { ClientEvents, RoomEvents } from "../customEvents";
import { IPongFrameDoubles } from "./modes/doubles/PongGameDoubles";

export abstract class PongRoom<T extends PongGame> extends SessionRoom
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
	abstract addPlayer(player: PongPlayer): boolean;
	abstract removePlayer(player:PongPlayer): void;
	abstract getRoomWinner(): Promise<PongPlayer>;
	abstract getRoomLoser(): Promise<PongPlayer>;
	abstract disconnectBehaviour(rageQuitPlayer: PongPlayer): void;
	abstract sendCurrentFrame(): void;

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

	getRoundName()
	{
		return this.matchName;
	}

	// async getRoomWinner():Promise<PongPlayer>
	// {
	// 	await this.game.waitForFinalWhistle();
	// 	return this.getWinner();
	// }

	// async getRoomLoser():Promise<PongPlayer>
	// {
	// 	await this.game.waitForFinalWhistle();
	// 	return this.getLoser();
	// }

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

	protected assingControlsToPlayer(player:PongPlayer):void 
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
			const paddle:Paddle = player.getPlayerPaddle(this.game);
			this.getGame().movePaddle(paddle, direction);
		})
	}

}