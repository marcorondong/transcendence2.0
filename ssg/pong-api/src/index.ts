import Fastify from "fastify"
import { Paddle } from "./Paddle";
import { Point } from "./Point";
import { Ball } from "./Ball";
import { PongFrame } from "./PongFrame";
import websocket from "@fastify/websocket"
import { WebSocket, RawData } from "ws";

const PORT:number = 3010;
const HOST:string = "0.0.0.0"


const fastify = Fastify({logger: true});

const leftPaddle: Paddle = new Paddle(new Point(-2.5, 0));
const rightPaddle: Paddle = new Paddle(new Point(2.5, 0));
const ball: Ball = new Ball(new Point(0, 0));

fastify.register(websocket);
fastify.register(async function(fastify)
{
	fastify.get("/", (request, reply) =>
	{
		reply.send(PongFrame.getPongFrame(leftPaddle, rightPaddle, ball));
		ball.moveBall();
		leftPaddle.moveUp();
		rightPaddle.moveDown();
		rightPaddle.moveDown();
	});

	fastify.get("/pong/", {websocket:true}, (connection, req) =>
	{
		var counter = 1;
		const interval = setInterval(() => 
		{
			sendFrames(connection);
		}, 1000);
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
})


function sendFrames(socket: WebSocket)
{
	const frame = PongFrame.getPongFrame(leftPaddle, rightPaddle, ball);
	const frameJson = JSON.stringify(frame)
	socket.send(frameJson)
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