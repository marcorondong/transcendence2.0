import Fastify, {
	FastifyReply,
	FastifyRequest,
} from "fastify";
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

const PORT = parseInt(process.env.PORT || "3001", 10);
const HOST = process.env.HOST || "0.0.0.0";

const server = Fastify(serverOption).withTypeProvider<ZodTypeProvider>();

// TODO remove this after frontend is built
server.register(fastifyStatic, {
	root: path.join(__dirname, "../public"),
	prefix: "/",
});

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
server.register(fastifyWebsocket);
server.register(webSocketConnection, { prefix: "/tictactoe" });

// TODO remove this after frontend is built
server.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
	return reply.sendFile("tictactoe.html");
});

const start = async () => {
	try {
		await server.listen({ port: PORT, host: HOST });
		console.log(`Server listening at ${PORT}`);
	} catch (err) {
		server.log.error("Error catch in start()",err);
		process.exit(1);
	}
};

start();
