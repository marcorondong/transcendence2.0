import Fastify from "fastify"
import { Paddle } from "./Paddle";
import {PingPongGame, PongFrameI } from "./PongGame";
import websocket from "@fastify/websocket"
import { WebSocket, RawData } from "ws";
import {Parser} from "../../utils/Parser"
import fs from "fs"
import path from 'path';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv'
import { PongRoom } from "./PongRoom";
import { Player } from "../../utils/Player";


dotenv.config();
const PORT:number = 3010;
const HOST:string = "0.0.0.0"

const privateKeyPath:string = path.join(__dirname, "../server-keys/key.pem")
const certificatePath:string = path.join(__dirname, "../server-keys/cert.pem")
let privateKey: string; 
let certificate: string;
var totalGameCount = 0;

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


//const gameRoom:PongRoom = new PongRoom("1");
const rooms:Map<string, PongRoom> = new Map<string, PongRoom>();

function getOrCreateGameRoom(gameRoomId:string): PongRoom
{
	var room:PongRoom | undefined
	if (rooms.has(gameRoomId))
	{
		console.log(`returning game with id ${gameRoomId}`);
		room = rooms.get(gameRoomId);
	}
	if(room == undefined)
	{
		totalGameCount++;
		if(gameRoomId === undefined)
		{
			gameRoomId = totalGameCount.toString()
		}
		room = new PongRoom(gameRoomId)
		console.log(`creating game with id ${gameRoomId}`);
		rooms.set(gameRoomId, room);
	}
	return room
}


fastify.register(fastifyStatic, {
	root: path.join(process.cwd(), "src/public"), // Ensure this path is correct
	prefix: "/", // Optional: Sets the URL prefix
  });

interface GameQueryI
{
	gameId: string;
	playerId: string;
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

	fastify.get<{Querystring: GameQueryI}>("/pong/", {websocket:true}, (connection, req) =>
	{
		const {gameId, playerId} = req.query;
		const gameRoom = getOrCreateGameRoom(gameId);
		gameRoom.getAndSendFramesOnce();
		if(gameRoom.getPlayerCount() === 0)
		{
			gameRoom.addPlayer(new Player("PlayerId1", connection))
			moveHandler(connection, gameRoom.getGame(), "left");
			console.log("player 1")
		}
		else if(gameRoom.getPlayerCount() === 1)
		{
			console.log("player 2")
			gameRoom.addPlayer(new Player("PlayerId2", connection))
			moveHandler(connection, gameRoom.getGame(), "right");
			gameRoom.getGame().start();
		}
		else
		{
			gameRoom.addSpectator(connection)
		}

		connection.on("close", () => {
			gameRoom.removeSpectator(connection);
			console.log("spectator removed");
			// if (gameRoom.getPlayerCount() === 0) {
			//   rooms.delete(gameId);
			// }
		  });

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



function moveHandler(socket: WebSocket, game:PingPongGame, paddleSide: "left" | "right")
{
	socket.on("message", (data: RawData, isBinnary:boolean) =>
	{
		const json = Parser.rawDataToJson(data);
		if(!json)
		{
			socket.send("Invalid json");
			return 
		}
		const direction = json.move;
		const paddle:Paddle = game.getPaddle(paddleSide);
		game.movePaddle(paddle, direction);
	})
}

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