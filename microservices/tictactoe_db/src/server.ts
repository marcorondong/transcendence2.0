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

const PORT = parseInt(process.env.PORT || "3003", 10);
const HOST = process.env.HOST || "0.0.0.0";

const server = Fastify(serverOption).withTypeProvider<ZodTypeProvider>();
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
server.setErrorHandler(globalErrorHandler);
server.register(fastifySwagger, swaggerOption as SwaggerOptions);
server.register(fastifySwaggerUi, swaggerUiOption);
server.register(tictactoeRoutes, { prefix: "/tictactoe-db" });

const start = async () => {
	try {
		await server.listen({ port: PORT, host: HOST });
		console.log(`tictactoe_db is running on port ${PORT}`);
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

start();
