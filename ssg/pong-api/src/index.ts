import Fastify from "fastify"
import websocket from "@fastify/websocket"
import { WebSocket, RawData } from "ws";
import fs from "fs"
import path from 'path';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv'
import { PongRoom } from "./PongRoom";
import { PongPlayer } from "./PongPlayer";
import { SingleMatchMaking } from "./SingleMatchMaking";
import { Tournament } from "./Tournamnet";


dotenv.config();

//Server set up variables
const PORT:number = 3010;
const HOST:string = "0.0.0.0"
const privateKeyPath:string = path.join(__dirname, "../server-keys/key.pem")
const certificatePath:string = path.join(__dirname, "../server-keys/cert.pem")
let privateKey: string; 
let certificate: string;

try 
{
	privateKey = fs.readFileSync(privateKeyPath, "utf-8");
	certificate = fs.readFileSync(certificatePath, "utf-8");
}
catch
{
	console.error("ssl private key and certificate are not generated. Run https-key.sh script inside scripts folder first")
	process.exit(1);
	
}

const fastify = Fastify(
{
	https:
	{
		key: privateKey,
		cert: certificate
	},
	
	logger: process.env.NODE_ENV === "development"?
	{
		transport:
		{
			target: "pino-pretty",
			options:
			{
				colorize: true, //enables colors
				translateTime: "HH:MM:ss Z", //formating timestamt
				ignore: "pid,hostname" //Hide fields
			}
		}
	}
	: true
});
	

function playerRoomJoiner(roomId:0 | string, connection:WebSocket):PongRoom
{
	if(roomId === 0)
	{
		const roomToJoin = singlesManager.isAnyPublicRoomAvailable();
		if(roomToJoin !== false)
		{
			const player:PongPlayer = new PongPlayer(connection, "right");
			roomToJoin.addRightPlayer(player)
			roomToJoin.getGame().startGame();
			return roomToJoin;
		}
		else 
			return singlesManager.createRoomAndAddFirstPlayer(connection);
	}
	else 
	{
		const roomWithId = singlesManager.getRoom(roomId);
		if(roomWithId === undefined)
			return singlesManager.createRoomAndAddFirstPlayer(connection);
		else
		{
			const player:PongPlayer = new PongPlayer(connection, "right");
			roomWithId.addRightPlayer(player)
			roomWithId.getGame().startGame();
			return roomWithId;
		}
	}
}

function spectatorJoin(roomId:string | 0, connection:WebSocket) :boolean
{
	if(roomId === 0)
		return false;
	const roomWithId = singlesManager.getRoom(roomId);
	if(roomWithId !== undefined)
	{
		roomWithId.addSpectator(connection);
		return true
	}
	return false;
}


const singlesManager:SingleMatchMaking = new SingleMatchMaking();


fastify.register(fastifyStatic, {
	root: path.join(process.cwd(), "src/public"), // Ensure this path is correct
	prefix: "/", // Optional: Sets the URL prefix
  });

interface GameRoomQueryI
{
	roomId: string | 0;
	playerId: string;
	privateRoom: boolean;
	clientType: "player" | "spectator";
	matchType: "single" | "tournament";
} 

//TODO try to move this in some class
function closeConnectionLogic(connection:WebSocket, room?:PongRoom)
{	
	connection.on("close", () => {
	if(room?.isFull() === false)
	{
		console.log(`Deleting room: ${room.getId()}`);
		singlesManager.removeRoom(room);
	}
	});
}

function spectatorLogic(roomId:string | 0, connection:WebSocket)
{
	if(spectatorJoin(roomId, connection))
	{
		console.log(`Spectator joined to room: ${roomId}`)
		connection.send(JSON.stringify(roomId));
	}
	else 
	{
		connection.send(`Room: ${roomId} you tried to join does not exist`);
		connection.close();
	}
}

function singleMatchMaking(clientType: "player" | "spectator", roomId: 0 | string, connection:WebSocket)
{
	let room:PongRoom | undefined;
	if(clientType === "player")
	{
		room = playerRoomJoiner(roomId, connection);
		console.log(`Player joined to room:${room.getId()}`);
		const status = PongRoom.createMatchStatusUpdate("Waiting for opponnenetns saf")
		const roomIdJson = {roomId: room.getId(),
			...status //spreading properties
		};
		connection.send(JSON.stringify(roomIdJson));
	}
	if(room !== undefined && room.isFull())
		room.getAndSendFramesOnce();
	if(clientType ==="spectator")
		spectatorLogic(roomId, connection);
	closeConnectionLogic(connection, room);
}

const simpleTournamnet:Tournament = new Tournament(4);

function tournamentJoiner(connection:WebSocket)
{
	const proPlayer:PongPlayer = new PongPlayer(connection, "TBD");
	simpleTournamnet.addPlayer(proPlayer);
	const freeSpots = simpleTournamnet.caluclateNumberOfFreeSpots();
	simpleTournamnet.sendAnnouncementToEveryone(`We are waiting for ${freeSpots} player to join. Be patient`);
}

simpleTournamnet.once("full tournament", () =>
{
	console.log("Seoska liga pocinje pripremite prase i janje");
	simpleTournamnet.startTournament();
})


fastify.register(websocket);
fastify.register(async function(fastify)
{
	fastify.get("/", (request, reply) =>
	{
		reply.send(
		{
			hello: "ssl"
		}
		)
	});

	//Partial makes all field optional. 
	fastify.get<{Querystring: Partial<GameRoomQueryI>}>("/pong/", {websocket:true}, (connection, req) =>
	{
		const {
			roomId = 0,
			playerId= "Player whatever",
			privateRoom = false,
			clientType = "player",
			matchType = "single"
		} = req.query as GameRoomQueryI;
		if(matchType === "single")
		{
			singleMatchMaking(clientType, roomId, connection);
			console.log("Single match activated");
		}
		else if(matchType === "tournament")
			tournamentJoiner(connection);

	})

	fastify.get("/pingpong/", async (request, reply) => {
		const filePath = path.join(process.cwd(), "src/public/pong.html");
		console.log(`Serving file from: ${filePath}`);
		if (fs.existsSync(filePath)) {
		  return reply.sendFile("pong.html"); // Serve public/index.html
		} else {
		  reply.status(404).send({ error: "File not found" });
		}
	  });
})

const startServer = async() =>
{
	try 
	{
		await fastify.listen({port: PORT, host: HOST});
		console.log(`Pong server is runnig on https://${HOST}:${PORT}`);
	}
	catch(err)
	{
		console.log(err);
		process.exit(1);
	}
}

startServer();