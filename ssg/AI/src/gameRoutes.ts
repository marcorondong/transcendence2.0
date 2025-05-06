import { FastifyInstance } from "fastify";
import {
	gameRequestSchema,
	extraGameSchema,
	healthSchema,
} from "./gameRequestSchema";
import { Bot } from "./bot";

export async function gameRoutes(fastify: FastifyInstance) {
	fastify.post(
		"/game-mandatory",
		{ schema: gameRequestSchema },
		async (request: any, reply: any) => {
			if (!request.body) {
				return reply.code(400).send({ error: "Invalid game request" });
			}
			const gameRequest = new Object({
				roomId: request.body.roomId,
				difficulty: request.body.difficulty,
				mode: "mandatory",
			});
			try {
				new Bot(gameRequest).playGame();
				reply.code(200).send({
					description: "Game successfully started",
					gameRequest,
				});
			} catch (error) {
				request.log.error(error);
				reply.code(500).send({ error: "Failed to start bot" });
			}
		},
	);
	fastify.post(
		"/game-extra",
		{ schema: extraGameSchema },
		async (request: any, reply: any) => {
			const gameRequest = request.body as object;
			if (!gameRequest) {
				return reply.code(400).send({ error: "Invalid game request" });
			}

			try {
				new Bot(gameRequest).playGame();
				reply.code(200).send({
					description: "Game successfully started",
					gameRequest,
				});
			} catch (error) {
				request.log.error(error);
				reply.code(500).send({ error: "Failed to start bot" });
			}
		},
	);
}

export async function healthRoute(fastify: FastifyInstance) {
	fastify.get(
		"/health-check",
		{ schema: healthSchema },
		async (request: any, reply: any) => {
			reply.code(200).send({ status: "ok" });
		},
	);
}
