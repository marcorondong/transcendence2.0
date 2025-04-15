import Fastify, {
	FastifyInstance,
	FastifyReply,
	FastifyRequest,
} from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import { Client } from "./Client";
// import { onClientMessage, onClientDisconnect } from './utils';
import { faker } from "@faker-js/faker";
import fastifyStatic from "@fastify/static";
import path from "path";
import { createPlayerInDB } from "./dbUtils";

const PORT = 3001;
const HOST = "0.0.0.0";
let friendClient: Client | null = null;

const fastify: FastifyInstance = Fastify({ logger: false });

fastify.register(fastifyStatic, {
	root: path.join(__dirname, "../public"),
	prefix: "/",
});

fastify.register(fastifyWebsocket);

fastify.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
	return reply.sendFile("tictactoe.html");
	// return reply.send("Hello World!");
});


fastify.register(async function (fastify) {
	fastify.get("/ws", { websocket: true }, (connection, req) => {
		const id = faker.person.firstName();
		const socket = connection as unknown as WebSocket;
		const client = new Client(id, socket);
		createPlayerInDB(client.getId());
		console.log("Client connected. clientId:", client.getId());

		if (friendClient === null) {
			friendClient = client;
		} else {
			const sign = Math.random() < 0.5 ? "X" : "O";
			const friendSign = sign === "X" ? "O" : "X";
			client.setFriendClient(friendClient);
			client.setSign(sign);
			client.getSocket().send(
				JSON.stringify({
					gameSetup: true,
					userId: client.getId(),
					opponentId: friendClient.getId(),
					yourSign: sign,
					turn: client.getTurn(),
				}),
			);
			friendClient.setFriendClient(client);
			friendClient.setSign(friendSign);
			friendClient.getSocket().send(
				JSON.stringify({
					gameSetup: true,
					userId: friendClient.getId(),
					opponentId: client.getId(),
					yourSign: friendSign,
					turn: friendClient.getTurn(),
				}),
			);
			friendClient = null;
		}

		connection.on("message", (message: string) => {
			try {
				const data = JSON.parse(message);
				if (data.index !== undefined) {
					const friend = client.getFriendClient();
					if (friend) {
						if (client.getTurn()) {
							client.getSocket().send(
								JSON.stringify({
									index: data.index,
									sign: client.getSign(),
								}),
							);
							friend.getSocket().send(
								JSON.stringify({
									index: data.index,
									sign: client.getSign(),
								}),
							);
							client.setTurn(false);
							friend.setTurn(true);
						} else {
							client
								.getSocket()
								.send(
									JSON.stringify({ error: "Not your turn" }),
								);
						}
					}
				}
			} catch (error) {
				console.error(error);
				socket.send(JSON.stringify({ error: "Something went wrong" }));
			}
		});

		connection.on("close", (code: number, reason: Buffer) => {
			console.log("Client disconnected: clientId:", client.getId());
			const friend = client.getFriendClient();
			if (friend) {
				friend.getSocket().send(
					JSON.stringify({
						gameOver: "Your friend has left the game",
					}),
				);
				friend.getSocket().close();
			} else {
				friendClient = null;
			}
		});
		// connection.on('message', (message: string) => onClientMessage(message, client));

		// connection.on('close', (code: number, reason: Buffer) => onClientDisconnect(code, reason, client));
	});
});

const start = async () => {
	try {
		await fastify.listen({ port: PORT, host: HOST });
		console.log(`Server listening at ${PORT}`);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
