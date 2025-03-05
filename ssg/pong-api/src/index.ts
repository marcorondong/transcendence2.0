import Fastify from "fastify"
import websocket from "@fastify/websocket"
import { WebSocket, RawData } from "ws";
import fs from "fs"
import path from 'path';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv'
import { PongRoom } from "./PongRoom";
import { PongPlayer } from "./PongPlayer";
import { PongRoomManager } from "./PongRoomManager";
import { Parser } from "../../utils/Parser";


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
		const roomToJoin = roomManager.isAnyPublicRoomAvailable();
		if(roomToJoin !== false)
		{
			const player:PongPlayer = new PongPlayer(connection, "right");
			roomToJoin.addRightPlayer(player)
			roomToJoin.getGame().start();
			return roomToJoin;
		}
		else 
			return roomManager.createRoomAndAddFirstPlayer(connection);
	}
	else 
	{
		const roomWithId = roomManager.getRoom(roomId);
		if(roomWithId === undefined)
			return roomManager.createRoomAndAddFirstPlayer(connection);
		else
		{
			const player:PongPlayer = new PongPlayer(connection, "right");
			roomWithId.addRightPlayer(player)
			roomWithId.getGame().start();
			return roomWithId;
		}
	}
}

function spectatorJoin(roomId:string | 0, connection:WebSocket) :boolean
{
	if(roomId === 0)
		return false;
	const roomWithId = roomManager.getRoom(roomId);
	if(roomWithId !== undefined)
	{
		roomWithId.addSpectator(connection);
		return true
	}
	return false;
}


const roomManager:PongRoomManager = new PongRoomManager();


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
} 

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
			clientType = "player"	
		} = req.query as GameRoomQueryI;

		let room:PongRoom | undefined;

		console.log(clientType);
		if(clientType === "player")
		{
			room = playerRoomJoiner(roomId, connection);
			//room.disconnectBehaviour();
			console.log(`Player joined to room:${room.getId()}`);
			const roomIdJson = {roomId: room.getId()};
			connection.send(JSON.stringify(roomIdJson));
		}
		if(room !== undefined && room.isFull())
			room.getAndSendFramesOnce();
		if(clientType ==="spectator")
		{
			console.log("Client joining")
			if(spectatorJoin(roomId, connection))
			{
				console.log(`Spectator joined to room:${roomId}`)
				connection.send(JSON.stringify(roomId));
			}
		}

		// connection.on("close", () => {
		// 	gameRoom.removeSpectator(connection);
		// 	console.log("spectator removed");
		// 	// if (gameRoom.getPlayerCount() === 0) {
		// 	//   rooms.delete(gameId);
		// 	// }
		//   });

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
		console.log(`Pong server is runnig on http://${HOST}:${PORT}`);
	}
	catch(err)
	{
		console.log(err);
		process.exit(1);
	}
}

startServer();