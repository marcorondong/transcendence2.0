import { FastifyInstance } from "fastify";
import { gameRequestSchema, healthSchema } from "./gameSchema";
import { Bot } from "./bot";
import { tokenRoute } from "./config";

async function cookieSubRequest(gameRequestReply: any): Promise<string> {
	const res = await fetch(tokenRoute);

	if (!res.ok) {
		gameRequestReply.code(401).send({ error: "bot is unauthorized" });
		throw new Error("bot is unauthorized");
	}

    const authResponse = await res.json();
	console.log("Auth response received:", authResponse);

	if (!authResponse || !authResponse.access_token) {
		gameRequestReply.code(500).send({ error: "Failed to retrieve auth data" });
		throw new Error("Failed to retrieve auth data");
	}

	const token = authResponse.access_token;
	if (!token) {
		gameRequestReply.code(500).send({ error: "Token not found in response" });
		throw new Error("Token not found in response");
	}
	console.log("Token retrieved successfully:", token);

	return "access_token=" + token;
}

export async function gameRoute(fastify: FastifyInstance) {
	fastify.post(
		"/game-mandatory",
		{ schema: gameRequestSchema },
		async (request: any, reply: any) => {
			const cookies = await cookieSubRequest(reply);

			const gameRequest = {
				roomId: request.body.roomId,
				difficulty: request.body.difficulty,
				mode: "mandatory",
			};
			try {
				new Bot(gameRequest).playGame(cookies);
				reply.code(200).send({
					description: `Game id ${gameRequest.roomId} successfully started`,
				});
			} catch (error) {
				console.error(error);
				reply.code(500).send({ error: "Failed to start bot" });
			}
		},
	);
}

export async function debugRoute(fastify: FastifyInstance) {
	fastify.post(
		"/game-debug",
		{ schema: gameRequestSchema },
		async (request: any, reply: any) => {
			const cookies = await cookieSubRequest(reply);

			const gameRequest = request.body;
			try {
				new Bot(gameRequest).playGame(cookies);
				reply.code(200).send({
					description: `Game id ${gameRequest.roomId} successfully started`,
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
