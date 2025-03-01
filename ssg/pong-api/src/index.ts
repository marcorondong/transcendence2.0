import Fastify from "fastify"
import { Paddle } from "./Paddle";
import {PingPongGame, PongFrameI } from "./PongGame";
import websocket from "@fastify/websocket"
import { WebSocket, RawData } from "ws";
import {Parser} from "../../utils/Parser"
import raf from "raf";
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


const gameRoom:PongRoom = new PongRoom("1");
let player:number = 1;


fastify.register(fastifyStatic, {
	root: path.join(process.cwd(), "src/public"), // Ensure this path is correct
	prefix: "/", // Optional: Sets the URL prefix
  });

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

	fastify.get("/pong/", {websocket:true}, (connection, req) =>
	{
		sendFrames(gameRoom);
		if(player === 1)
		{
			gameRoom.addPlayer(new Player("first left", connection))
			moveHandler(connection, gameRoom.getGame(), "left");
		}
		else if(player === 2)
		{
			gameRoom.addPlayer(new Player("second right", connection))
			moveHandler(connection, gameRoom.getGame(), "right");
			gameRoom.getGame().start();
		}
		gameRoom.addSpectator(connection);
		player++;
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


function sendFrames(gameRoom:PongRoom)
{
	const renderFrame = () => {
		const frame: PongFrameI = gameRoom.getGame().getFrame();
		const frameJson = JSON.stringify(frame);
		gameRoom.roomBroadcast(frameJson)
		if(gameRoom.getGame().isLastFrame())
		{
			return;
		}
		raf(renderFrame);
	};
	raf(renderFrame);
}

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
		const paddle:Paddle = gameRoom.getGame().getPaddle(paddleSide);
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