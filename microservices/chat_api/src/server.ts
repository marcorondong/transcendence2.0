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

const server = Fastify(serverOption).withTypeProvider<ZodTypeProvider>();
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
server.register(fastifyWebsocket);
server.register(webSocketConnection);
server.register(fCookie);

const start = async () => {
	try {
		await server.listen({ port: env.CHAT_API_PORT, host: env.HOST });
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

start();
