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
import { pongRoutes } from "./routes/routes";
import { env } from "./utils/env";

// console.log("process.env keys:", Object.keys(process.env));


const server = Fastify(serverOption).withTypeProvider<ZodTypeProvider>();
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
server.setErrorHandler(globalErrorHandler);
server.register(fastifySwagger, swaggerOption as SwaggerOptions);
server.register(fastifySwaggerUi, swaggerUiOption);
server.register(pongRoutes);

const start = async () => {
	try {
		await server.listen({ port: env.PORT, host: env.HOST });
		console.log(`Server is running at ${env.PORT}`);
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

start();
