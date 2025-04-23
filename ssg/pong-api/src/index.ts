import Fastify from "fastify";
import websocket from "@fastify/websocket";
import fs from "fs";
import path from "path";
import fastifyStatic from "@fastify/static";
import dotenv from "dotenv";
import { MatchMaking } from "./match-making/MatchMaking";
import { Tournament } from "./game/modes/singles/Tournament";

dotenv.config();

const PORT: number = 3010;
const HOST: string = "0.0.0.0";

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

export interface IGameRoomQuery {
	roomId: string | 0;
	playerId: string;
	privateRoom: boolean;
	clientType: "player" | "spectator";
	matchType: "singles" | "tournament" | "doubles";
	tournamentSize: number;
}

fastify.register(websocket);
fastify.register(async function (fastify) {
	fastify.get("/", (request, reply) => {
		reply.send({
			hello: "ssl",
		});
	});

	fastify.get("/healthcheck", async (request, reply) => {
		reply.code(200).send({
			message:
				"You ping to pingpong pong-api so pong-api pong back to ping. Terrible joke; Don't worry, I'll let myself out",
		});
	});

	fastify.get("/playerRoom/:playerId", async (request, reply) => {
		const { playerId } = request.params as { playerId: string };
		reply.send({
			roomId: manager.getPlayerRoomId(playerId),
		});
	});

	//Partial makes all field optional.
	fastify.get<{ Querystring: Partial<IGameRoomQuery> }>(
		"/pong/",
		{ websocket: true },
		(connection, req) => {
			const {
				roomId = 0,
				playerId = "Player whatever",
				privateRoom = false,
				clientType = "player",
				matchType = "singles",
				tournamentSize = Tournament.getDefaultTournamentSize(),
			} = req.query as IGameRoomQuery;

			const gameQuery: IGameRoomQuery = {
				roomId,
				playerId,
				privateRoom,
				clientType,
				matchType,
				tournamentSize,
			};
			manager.matchJoiner(connection, gameQuery);
		},
	);

	fastify.get("/pingpong/", async (request, reply) => {
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
