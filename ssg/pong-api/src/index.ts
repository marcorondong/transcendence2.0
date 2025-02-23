import Fastify from "fastify"
import { Paddle } from "./Paddle";
import { Point } from "./Point";
import { Ball } from "./Ball";
import { PingPongGame, PongFrameI } from "./PongGame";
import websocket from "@fastify/websocket"
import { WebSocket, RawData } from "ws";
import {Parser} from "../../utils/Parser"

import fs from "fs"
import path from 'path';
import fastifyStatic from '@fastify/static';

const PORT:number = 3010;
const HOST:string = "0.0.0.0"


const fastify = Fastify({logger: true});

const leftPaddle: Paddle = new Paddle(new Point(-2.5, 0));
const rightPaddle: Paddle = new Paddle(new Point(2.5, 0));
const ball: Ball = new Ball(new Point(0, 0));

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
		moveHandler(connection, leftPaddle);

		// connection.on("message", (data: RawData, isBinnary: boolean) =>
		// {
		// 	leftPaddle.moveUp();
		// })
		// var counter = 1;
		// const interval = setInterval(() => 
		// {
		// 	sendFrames(connection);
		// }, 1000);
		// const clienId = generateId++;
		// const player1:Player = new Player(clienId.toString(), connection);
		// console.log(`Loggin player info ${player1.id}`)
	
		// addPlayerToRoom(oneRoom, player1)
	
		// connection.on("message", (message:RawData)=>
		// {
		// onMessageHandler(message, oneRoom, player1);
		// })
	
		// connection.on("close", (code:number, reason:Buffer) =>
		// {
		// console.log(`Client ${clienId} disconnected`);
		// console.log(`Reason ${code} buffer: ${reason}`)
		// oneRoom.removePlayer(player1);
		// })
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
	const interval = setInterval(() => 
	{
		const frame:PongFrameI = PingPongGame.getPongFrame(leftPaddle, rightPaddle, ball);
		const frameJson = JSON.stringify(frame)
		socket.send(frameJson)
		game.renderNextFrame();
		//ball.moveBall();
	}, 1000/60)
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
		console.log(direction);
		paddle.move(direction);
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