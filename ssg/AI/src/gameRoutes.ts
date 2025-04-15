import { FastifyInstance } from "fastify";
import { gameRequestSchema } from "./gameRequestSchema";
import { healthSchema } from "./gameRequestSchema";
import { Bot } from "./bot";

export async function gameRoutes(fastify: FastifyInstance) {
	fastify.post(
		"/start-game",
		{ schema: gameRequestSchema },
		async (request, reply) => {
			const gameRequest = request.body as object;
			if (!gameRequest) {
				return reply.code(400).send({ error: "Invalid game request" });
			}

			try {
				new Bot(gameRequest).playGame();
				reply
					.code(200)
					.send({
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
//TODO fix health
export async function healthRoute(fastify: FastifyInstance) {
	fastify.get(
		'/health',
		{ schema: healthSchema },
		async (request, reply) => {
			reply.code(200).send({ status: "ok" });
		}
	);
}