import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import { serverOption } from "./utils/options";
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler,
} from "fastify-type-provider-zod";
import fastifyWebsocket from "@fastify/websocket";
import { webSocketConnection } from "./webSocketConnection/webSocketConnection";
import fastifyStatic from "@fastify/static"; // TODO remove this after frontend is built
import path from "path"; // TODO remove this after frontend is built
import fCookie from "@fastify/cookie";
import { env } from "./utils/env";

const server = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

// TODO remove this after frontend is built
server.register(fastifyStatic, {
	root: path.join(__dirname, "../public"),
	prefix: "/",
});

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
server.register(fastifyWebsocket);
server.register(webSocketConnection);
server.register(fCookie);

// TODO remove this after frontend is built
server.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
	return reply.sendFile("tictactoe.html");
});

const start = async () => {
	try {
		await server.listen({ port: env.TICTACTOE_API_PORT, host: env.HOST });
		console.log(`tictactoe_api running on port ${env.TICTACTOE_API_PORT}`);
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

start();
