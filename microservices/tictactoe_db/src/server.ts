import Fastify from "fastify";
import { serverOption, swaggerOption, swaggerUiOption } from "./utils/options";
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler,
} from "fastify-type-provider-zod";
import { globalErrorHandler } from "./utils/globalErrorHandler";
import fastifySwagger, { SwaggerOptions } from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { tictactoeRoutes } from "./routes/routes";
import { env } from "./utils/env";

// use "serverOption" instead of "{ logger: true }" to activate pino-pretty
const server = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
server.setErrorHandler(globalErrorHandler);
server.register(fastifySwagger, swaggerOption as SwaggerOptions);
server.register(fastifySwaggerUi, swaggerUiOption);
server.register(tictactoeRoutes);

const start = async () => {
	try {
		await server.listen({ port: env.TICTACTOE_DB_PORT, host: env.HOST });
		console.log(`tictactoe_db is running on port ${env.TICTACTOE_DB_PORT}`);
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

start();
