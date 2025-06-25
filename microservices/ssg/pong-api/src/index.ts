import { gameLog, interpretGame } from "./blockchain-transaction/recordGame";
import { HeadToHeadQuery } from "./utils/zodSchema";
import { MatchMaking } from "./match-making/MatchMaking";
import { Parsing } from "./utils/Parsing";
import { PongPlayer } from "./game/PongPlayer";
import { PongSwagger } from "./utils/swagger";
import { serverConfig } from "./config";
import dotenv from "dotenv";
import Fastify, { FastifyRequest } from "fastify";
import fCookie from "@fastify/cookie";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import websocket, { WebSocket } from "@fastify/websocket";

dotenv.config();

function processPlayerJoin(
	matchType: string,
	req: FastifyRequest,
	connection: WebSocket,
	player: PongPlayer,
) {
	if (matchType === "singles" || matchType === "doubles") {
		const roomId = Parsing.parseRoomId(req, connection);
		if (roomId === false) return;
		if (matchType === "singles") manager.playerJoinSingles(player, roomId);
		else if (matchType === "doubles")
			manager.playerJoinDoubles(player, roomId);
	} else if (matchType === "tournament") {
		const tournamentSize = Parsing.parseTournamentSize(req, connection);
		if (tournamentSize === false) return;
		manager.playerJoinTournament(player, tournamentSize);
	} else {
		connection.close(1008, "Unknown match type");
	}
}

const fastify = Fastify({
	logger: true,
	// process.env.NODE_ENV === "development"
	// 	? {
	// 			transport: {
	// 				target: "pino-pretty",
	// 				options: {
	// 					colorize: true, //enables colors
	// 					translateTime: "HH:MM:ss Z", //formatting timestamp
	// 					ignore: "pid,hostname", //Hide fields
	// 				},
	// 			},
	// 	  }
	// 	: true,
});

const manager: MatchMaking = new MatchMaking();

// fastify.register(fastifyStatic, {
// 	root: path.join(process.cwd(), "src/public"), // Ensure this path is correct
// 	prefix: "/", // Optional: Sets the URL prefix
// });

fastify.register(swagger, PongSwagger.getSwaggerOptions());

fastify.register(swaggerUi, {
	routePrefix: "/docs",
});

fastify.register(fCookie);
fastify.register(websocket);
fastify.register(async function (fastify) {
	fastify.get(
		`/${serverConfig.BASE_API_NAME}/health-check`,
		{ schema: PongSwagger.getHealthCheckSchema() },
		async (request, reply) => {
			reply.code(200).send({
				message:
					"You ping to pingpong pong-api so pong-api pong back to ping. Terrible joke; Don't worry, I'll let myself out",
			});
		},
	);

	fastify.get(
		`/${serverConfig.BASE_API_NAME}/${serverConfig.BLOCKCHAIN_PATH}/:gameId`,
		{ schema: PongSwagger.getBlockchainSchema() },
		async (req, reply) => {
			const { gameId } = req.params as { gameId: string };
			let responseCode = 200;
			const gameData = await interpretGame(gameId);
			const gameLogString = await gameLog(gameId);
			if (gameData === false || gameLogString === false) {
				responseCode = 404;
			}
			if (responseCode !== 200) {
				reply.code(responseCode).send({
					message: "Provided gameId is not recorded on blockchain",
				});
			} else {
				reply.send({
					message: "Record found",
					record: gameData,
					log: gameLogString,
				});
			}
		},
	);

	fastify.get(
		`/${serverConfig.BASE_API_NAME}/player-room/:playerId`,
		{
			schema: PongSwagger.getPlayerRoomSchema(),
		},
		async (request, reply) => {
			const { playerId } = request.params as { playerId: string };
			const playerRoomId = manager.getPlayerRoomId(playerId);
			if (playerRoomId === false) {
				console.warn("Request room of player id that is not found");
				reply.code(404).send({ success: false });
			} else
				reply.send({
					roomId: playerRoomId,
				});
		},
	);

	fastify.get(
		`/${serverConfig.BASE_API_NAME}/${serverConfig.BASE_GAME_PATH}/spectate/:roomId`,
		{ websocket: true, schema: PongSwagger.getWebsocketSchema() },
		(connection, req) => {
			const { roomId } = req.params as { roomId: string };
			console.log("Spectate game: ", roomId);
			manager.spectatorJoiner(connection, roomId);
		},
	);

	fastify.get<{ Querystring: Partial<HeadToHeadQuery> }>(
		`/${serverConfig.BASE_API_NAME}/${serverConfig.BASE_GAME_PATH}/:matchType`,
		{ websocket: true, schema: PongSwagger.getWebsocketSchema() },
		async (connection, req) => {
			const { matchType } = req.params as { matchType: string };
			const player = await PongPlayer.createAuthorizedPlayer(
				req.headers.cookie,
				connection,
			);
			if (player === false) return;
			if (manager.addPlayerToActiveList(player) == false) {
				player.sendError("You are already in a game Room");
				player.connection.close(1008, "Already in pong-api");
				return;
			}
			processPlayerJoin(matchType, req, connection, player);
		},
	);

	//Testing HTML PONG
	// fastify.get("/pong-api/ping-pong", async (request, reply) => {
	// 	const filePath = path.join(process.cwd(), "src/public/pong.html");
	// 	if (fs.existsSync(filePath)) {
	// 		return reply.sendFile("pong.html"); // Serve public/index.html
	// 	} else {
	// 		reply.status(404).send({ error: "File not found" });
	// 	}
	// });
});

const startServer = async () => {
	try {
		await fastify.listen({
			port: serverConfig.PORT,
			host: serverConfig.HOST,
		});
		console.log(
			`Pong server is running on https://${serverConfig.HOST}:${serverConfig.PORT}`,
		);
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
};

startServer();
