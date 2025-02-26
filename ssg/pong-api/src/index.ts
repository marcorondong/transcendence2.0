import Fastify from "fastify"
import { Paddle } from "./Paddle";
import { Point } from "./Point";
import { Ball } from "./Ball";
import { PingPongGame, PongFrameI } from "./PongGame";
import websocket from "@fastify/websocket"
import { WebSocket, RawData } from "ws";
import {Parser} from "../../utils/Parser"
import raf from "raf";
import fs from "fs"
import path from 'path';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv'


dotenv.config();
const PORT:number = 3010;
const HOST:string = "0.0.0.0"

const fastify = Fastify(
{
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

const leftPaddle: Paddle = new Paddle(new Point(-4, 0));
const rightPaddle: Paddle = new Paddle(new Point(4, 0));
const ball: Ball = new Ball(new Point(0, 0));
let player:number = 1;

const game: PingPongGame = new PingPongGame("1",leftPaddle, rightPaddle, ball);

fastify.register(fastifyStatic, {
	root: path.join(process.cwd(), "src/public"), // Ensure this path is correct
	prefix: "/", // Optional: Sets the URL prefix
  });

fastify.register(websocket);
fastify.register(async function(fastify)
{
	fastify.get("/", (request, reply) =>
	{
		reply.send(PingPongGame.getPongFrame(leftPaddle, rightPaddle, ball));
		ball.moveBall();
		leftPaddle.moveUp();
		rightPaddle.moveDown();
		rightPaddle.moveDown();
	});

	fastify.get("/pong/", {websocket:true}, (connection, req) =>
	{
		sendFrames(connection);
		if(player === 1)
			moveHandler(connection, leftPaddle);
		else if(player === 2)
			moveHandler(connection, rightPaddle);
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


function sendFrames(socket: WebSocket)
{
	const renderFrame = () => {
		const frame: PongFrameI = PingPongGame.getPongFrame(leftPaddle, rightPaddle, ball);
		const frameJson = JSON.stringify(frame);
		socket.send(frameJson);
		raf(renderFrame);
};
	raf(renderFrame);
}

function moveHandler(socket: WebSocket, paddle: Paddle)
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
		game.movePaddle(paddle, direction)
		//paddle.move(direction);
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