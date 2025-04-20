import Fastify, { FastifyInstance } from "fastify";
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler,
} from "fastify-type-provider-zod";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { SwaggerOptions } from "@fastify/swagger";
import { swaggerOptions, swaggerUiOptions } from "./swagger/swagger.options";
import { chatRoutes } from "./routes/routes";

const PORT = 3004;
const HOST = "0.0.0.0";

const server: FastifyInstance = Fastify({
	logger: false,
}).withTypeProvider<ZodTypeProvider>();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
server.register(fastifySwagger, swaggerOptions as SwaggerOptions);
server.register(fastifySwaggerUi, swaggerUiOptions);
server.register(chatRoutes, { prefix: "/chat" });

const start = async () => {
	try {
		await server.listen({ port: PORT, host: HOST });
		console.log(`Server listening at ${PORT}`);
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

start();
