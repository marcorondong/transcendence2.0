import Fastify from "fastify"
import { Paddle } from "./Paddle";
import { Point } from "./Point";
import { Ball } from "./Ball";
import { PongFrame } from "./PongFrame";

const PORT:number = 3010;
const HOST:string = "0.0.0.0"


const fastify = Fastify({logger: true});

const leftPaddle: Paddle = new Paddle(new Point(-2.5, 0));
const rightPaddle: Paddle = new Paddle(new Point(2.5, 0));
const ball: Ball = new Ball(new Point(0, 0));

fastify.register(async function(fastify)
{
	fastify.get("/", (request, reply) =>
	{
		reply.send(PongFrame.getPongFrame(leftPaddle, rightPaddle, ball));
		ball.moveBall();
		leftPaddle.moveUp();
		rightPaddle.moveDown();
		rightPaddle.moveDown();
	})
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