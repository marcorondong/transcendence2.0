import Fastify from "fastify"
import websocket from "@fastify/websocket"
import { WebSocket, RawData } from "ws";
import fs from "fs"
import path from 'path';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv'
import { PongRoom } from "./PongRoom";
import { Player } from "../../utils/Player";
import { PongRoomManager } from "./PongRoomManager";


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
	
	
const roomManager:PongRoomManager = new PongRoomManager();

function roomJoiner(roomId:0 | string, connection:WebSocket):PongRoom
{
	if(roomId === 0)
	{
		const roomToJoin = roomManager.isAnyPublicRoomAvailable();
		if(roomToJoin !== false)
		{
			roomToJoin.addAndAssingControlsToPlayer(new Player("rightPlayer2", connection), "right");
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
			roomWithId.addAndAssingControlsToPlayer(new Player("rightPlayer2", connection), "right");
			roomWithId.getGame().start();
			return roomWithId;
		}
	}
}


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

		if(clientType === "player")
		{
			room =roomJoiner(roomId, connection);
		}
		if(room !== undefined)
			room.getAndSendFramesOnce();
		// const gameRoom = getOrCreateGameRoom(gameId);
		// gameRoom.getAndSendFramesOnce();
		// if(gameRoom.getPlayerCount() === 0)
		// {
		// 	gameRoom.addPlayer(new Player("PlayerId1", connection));
		// 	gameRoom.assingControlsToPlayer(connection, "left");
		// 	console.log("player 1")
		// }
		// else if(gameRoom.getPlayerCount() === 1)
		// {
		// 	console.log("player 2")
		// 	gameRoom.addPlayer(new Player("PlayerId2", connection));
		// 	gameRoom.assingControlsToPlayer(connection, "right");
		// 	gameRoom.getGame().start();
		// }


		// else
		// {
		// 	gameRoom.addSpectator(connection)
		// }

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