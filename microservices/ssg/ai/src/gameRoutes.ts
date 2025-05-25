import { FastifyInstance } from "fastify";
import { gameRequestSchema, healthSchema } from "./gameSchema";
import { Bot } from "./bot";
import axios from "axios";
import { botConfig } from "./config";

async function cookieSubRequest(gameRequestReply: any): Promise<string> {
	const authResponse = await axios.post(
		"http://auth_api_container:2999/auth-api/sign-in",
		{ email: botConfig.email, password: botConfig.password },
		{
			headers: { "Content-Type": "application/json" },
			withCredentials: true,
		},
	);

	if (authResponse.status !== 201) {
		gameRequestReply.code(401).send({ error: "bot is unauthorized" });
		throw new Error("bot is unauthorized");
	}

	const cookies = authResponse.headers["set-cookie"];
	if (!cookies) {
		throw new Error("Bot received no access token");
	}
	console.log("Auth cookies received:", cookies);

	return cookies;
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
