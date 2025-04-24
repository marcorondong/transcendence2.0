import Fastify, {
	FastifyInstance,
	FastifyReply,
	FastifyRequest,
} from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyStatic from "@fastify/static"; // TODO remove this after frontend is built
import path from "path"; // TODO remove this after frontend is built
import { Player } from "./Player";
import { faker } from "@faker-js/faker"; // TODO remove this in production
import { postResult } from "./dbUtils";

const PORT = 3001;
const HOST = "0.0.0.0";
let friendPlayer: Player | null = null;

const server: FastifyInstance = Fastify({
	logger: false,
});

// TODO remove this after frontend is built
server.register(fastifyStatic, {
	root: path.join(__dirname, "../public"),
	prefix: "/",
});

server.register(fastifyWebsocket);

// TODO remove this after frontend is built
server.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
	return reply.sendFile("tictactoe.html");
});

server.register(async function (server) {
	server.get("/ws", { websocket: true }, (connection, req) => {
		const id = faker.person.firstName(); // TODO extract id from JWT token
		const socket = connection as unknown as WebSocket;
		const player = new Player(id, socket);
		console.log("Player connected. playerId:", player.getId()); // TODO remove this in production
		if (friendPlayer) {
			const opponent = friendPlayer;
			friendPlayer = null;
			player.finishSetup(opponent);
		} else {
			friendPlayer = player;
		}
		connection.on("message", (message: string) => {
			try {
				const data = JSON.parse(message);
				if (data.index !== undefined) {
					player.sendIndex(data.index);
				} else {
					player.getGame()?.sendError(player, "Invalid message");
				}
			} catch (error) {
				console.error(error); // TODO remove this in production
				socket.send(JSON.stringify({ error: "Something went wrong" })); // TODO maybe no need to inform the player about the error
			}
		});

		connection.on("close", async (code: number, reason: Buffer) => {
			console.log("player disconnected: playerId:", player.getId()); // TODO remove this in production
			const opponent = player.getOpponentPlayer();
			if (opponent && player.getDisconnected() === true) {
				const opponentSign = opponent.getSign();
				if (opponentSign === "X") {
					const response = await postResult(
						opponent.getId(),
						player.getId(),
						opponentSign,
					);
					if (!response) {
						console.error("Failed to save game result");
						opponent.getSocket().send(
							JSON.stringify({
								error: "Failed to save game result",
							}),
						);
					}
				} else {
					const response = await postResult(
						player.getId(),
						opponent.getId(),
						opponentSign,
					);
					if (!response) {
						console.error("Failed to save game result");
						opponent.getSocket().send(
							JSON.stringify({
								error: "Failed to save game result",
							}),
						);
					}
				}
				opponent.getSocket().send(
					JSON.stringify({
						gameOver: "Your friend has left the game",
					}),
				);
				opponent.setDisconnected(false);
				opponent.getSocket().close();
			} else {
				friendPlayer = null;
			}
		});
		// connection.on('message', (message: string) => onPlayerMessage(message, player));

		// connection.on('close', (code: number, reason: Buffer) => onPlayerDisconnect(code, reason, player));
	});
});

const start = async () => {
	try {
		await server.listen({ port: PORT, host: HOST });
		console.log(`Server listening at ${PORT}`);
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

start();
