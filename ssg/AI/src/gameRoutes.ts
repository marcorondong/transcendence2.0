import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { gameRequestSchema, extraGameSchema, healthSchema } from "./gameSchema";
import { Bot } from "./bot";

export async function gameRoute(fastify: FastifyInstance) {
	fastify.post(
		"/game-mandatory",
		{ schema: gameRequestSchema },
		async (request: any, reply: any) => {
			const gameRequest = new Object({
				roomId: request.body.roomId,
				difficulty: request.body.difficulty,
				mode: "mandatory",
			});
			try {
				new Bot(gameRequest).playGame();
				reply.code(200).send({
					description: `Game id ${request.roomId} successfully started`,
				});
			} catch (error) {
				console.error(error);
				reply.code(500).send({ error: "Failed to start bot" });
			}
		},
	);
}

export async function cheatRoute(fastify: FastifyInstance) {
	fastify.post(
		"/game-extra",
		{ schema: extraGameSchema },
		async (request: any, reply: any) => {
			const gameRequest = request.body as object;
			try {
				new Bot(gameRequest).playGame();
				reply.code(200).send({
					description: `Game id ${request.roomId} successfully started`,
				});
			} catch (error) {
				console.error(error);
				reply.code(500).send({ error: "Failed to start bot" });
			}
		},
	);
}

export async function healthRoute(fastify: FastifyInstance) {
	fastify.get(
		"/health-check",
		{ schema: healthSchema },
		async (_: any, reply: any) => {
			reply.code(200).send({ status: "ok" });
		},
	);
}
