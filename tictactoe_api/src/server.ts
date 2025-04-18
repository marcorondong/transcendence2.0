import Fastify, {
	FastifyInstance,
	FastifyReply,
	FastifyRequest,
} from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyStatic from "@fastify/static";
import path from "path";
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler,
	jsonSchemaTransform,
} from "fastify-type-provider-zod";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { SwaggerOptions } from "@fastify/swagger";
import { swaggerOptions, swaggerUiOptions } from "./swagger/swagger.options";
import { Player } from "./Player";
import { createPlayerInDB } from "./dbUtils";
import { gameRoutes } from "./gameRoutes/game.routes";
import { faker } from "@faker-js/faker";

const PORT = 3001;
const HOST = "0.0.0.0";
let friendPlayer: Player | null = null;

const server: FastifyInstance = Fastify({
	logger: false,
}).withTypeProvider<ZodTypeProvider>();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.register(fastifyStatic, {
	root: path.join(__dirname, "../public"),
	prefix: "/",
});

server.register(fastifyWebsocket);

server.register(fastifySwagger, swaggerOptions as SwaggerOptions);
server.register(fastifySwaggerUi, swaggerUiOptions);

server.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
	return reply.sendFile("tictactoe.html");
});

server.register(gameRoutes, { prefix: "/tictactoe" });

server.register(async function (server) {
	server.get("/ws", { websocket: true }, (connection, req) => {
		const id = faker.person.firstName();
		const socket = connection as unknown as WebSocket;
		const player = new Player(id, socket);
		createPlayerInDB(player.getId());
		console.log("Player connected. playerId:", player.getId());

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
				}
			} catch (error) {
				console.error(error);
				socket.send(JSON.stringify({ error: "Something went wrong" }));
			}
		});

		connection.on("close", (code: number, reason: Buffer) => {
			console.log("player disconnected: playerId:", player.getId());
			const friend = player.getOpponentPlayer();
			if (friend) {
				friend.getSocket().send(
					JSON.stringify({
						gameOver: "Your friend has left the game",
					}),
				);
				friend.getSocket().close();
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
