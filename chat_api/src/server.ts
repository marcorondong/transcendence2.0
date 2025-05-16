import Fastify from "fastify";
import { serverOption } from "./utils/options";
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler,
} from "fastify-type-provider-zod";
import fastifyWebsocket from "@fastify/websocket";
import { webSocketConnection } from "./webSocketConnection/webSocketConnection";

const PORT = parseInt(process.env.PORT || "3002", 10);
const HOST = process.env.HOST || "0.0.0.0";

const server = Fastify(serverOption).withTypeProvider<ZodTypeProvider>();
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
server.register(fastifyWebsocket);
server.register(webSocketConnection, { prefix: "/chat-api" });

const start = async () => {
	try {
		await server.listen({ port: PORT, host: HOST });
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

start();
