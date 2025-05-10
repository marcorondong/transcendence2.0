import Fastify from "fastify";
import websocket, { WebSocket } from "@fastify/websocket";
import fs from "fs";
import path from "path";
import fastifyStatic from "@fastify/static";
import dotenv from "dotenv";
import { MatchMaking } from "./match-making/MatchMaking";
import { HeadToHeadQuery, TournamentSizeQuery } from "./utils/zodSchema";
import { Parsing } from "./utils/Parsing";

dotenv.config();

const PORT: number = 3010;
const HOST: string = "0.0.0.0";
const BASE_API_NAME = "pong-api";
const BASE_GAME_PATH = "pong";

const fastify = Fastify({
	logger:
		process.env.NODE_ENV === "development"
			? {
					transport: {
						target: "pino-pretty",
						options: {
							colorize: true, //enables colors
							translateTime: "HH:MM:ss Z", //formatting timestamp
							ignore: "pid,hostname", //Hide fields
						},
					},
				}
			: true,
});

const manager: MatchMaking = new MatchMaking();

fastify.register(fastifyStatic, {
	root: path.join(process.cwd(), "src/public"), // Ensure this path is correct
	prefix: "/", // Optional: Sets the URL prefix
});

fastify.register(websocket);
fastify.register(async function (fastify) {
	fastify.get("/", (request, reply) => {
		reply.send({
			hello: "ssl",
		});
	});

	fastify.get(`/${BASE_API_NAME}/health-check`, async (request, reply) => {
		reply.code(200).send({
			message:
				"You ping to pingpong pong-api so pong-api pong back to ping. Terrible joke; Don't worry, I'll let myself out",
		});
	});

	fastify.get(
		`/${BASE_API_NAME}/player-room/:playerId`,
		async (request, reply) => {
			const { playerId } = request.params as { playerId: string };
			reply.send({
				roomId: manager.getPlayerRoomId(playerId),
			});
		},
	);

	fastify.get(
		`/${BASE_API_NAME}/${BASE_GAME_PATH}/spectate/:roomId`,
		{ websocket: true },
		(connection, req) => {
			const { roomId } = req.params as { roomId: string };
			console.log("Spectate game: ", roomId);
			manager.spectatorJoiner(connection, roomId);
		},
	);

	fastify.get<{ Querystring: Partial<HeadToHeadQuery> }>(
		`/${BASE_API_NAME}/${BASE_GAME_PATH}/singles`,
		{ websocket: true },
		(connection, req) => {
			const roomId = Parsing.parseRoomId(req, connection);
			if (roomId === false) return;
			manager.playerJoinSingles(connection, roomId);
		},
	);

	fastify.get<{ Querystring: Partial<HeadToHeadQuery> }>(
		`/${BASE_API_NAME}/${BASE_GAME_PATH}/doubles`,
		{ websocket: true },
		(connection, req) => {
			const roomId = Parsing.parseRoomId(req, connection);
			if (roomId === false) return;
			manager.playerJoinDoubles(connection, roomId);
		},
	);

	fastify.get<{ Querystring: Partial<TournamentSizeQuery> }>(
		`/${BASE_API_NAME}/${BASE_GAME_PATH}/tournament`,
		{ websocket: true },
		(connection, req) => {
			const tournamentSize = Parsing.parseTournamentSize(req, connection);
			if (tournamentSize === false) return;
			manager.playerJoinTournament(connection, tournamentSize);
		},
	);

	fastify.get("/pong-api/ping-pong", async (request, reply) => {
		const filePath = path.join(process.cwd(), "src/public/pong.html");
		if (fs.existsSync(filePath)) {
			return reply.sendFile("pong.html"); // Serve public/index.html
		} else {
			reply.status(404).send({ error: "File not found" });
		}
	});
});

const startServer = async () => {
	try {
		await fastify.listen({ port: PORT, host: HOST });
		console.log(`Pong server is running on https://${HOST}:${PORT}`);
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
};

startServer();
