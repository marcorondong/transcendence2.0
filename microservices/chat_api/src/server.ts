import Fastify from "fastify";
import { serverOption } from "./utils/options";
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler,
} from "fastify-type-provider-zod";
import fastifyWebsocket from "@fastify/websocket";
import { webSocketConnection } from "./webSocketConnection/webSocketConnection";
import fCookie from "@fastify/cookie";
import { env } from "./utils/env";

// use "serverOption" instead of "{ logger: true }" to activate pino-pretty
const server = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
server.register(fastifyWebsocket);
server.register(webSocketConnection);
server.register(fCookie);

const start = async () => {
	try {
		await server.listen({ port: env.CHAT_API_PORT, host: env.HOST });
		console.log(`chat_api is running on port ${env.CHAT_API_PORT}`);
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

start();
