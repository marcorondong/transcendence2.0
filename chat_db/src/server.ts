import Fastify from "fastify";
import fastifySwagger, { SwaggerOptions } from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler,
} from "fastify-type-provider-zod";
import { serverOption, swaggerOption, swaggerUiOption } from "./utils/options";
import { chatRoutes } from "./routes/routes";
import { globalErrorHandler } from "./utils/globalErrorHandler";

const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "0.0.0.0";

const server = Fastify(serverOption).withTypeProvider<ZodTypeProvider>();
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
server.register(fastifySwagger, swaggerOption as SwaggerOptions);
server.register(fastifySwaggerUi, swaggerUiOption);
server.register(chatRoutes, { prefix: "/chat" });
server.setErrorHandler(globalErrorHandler);

const start = async () => {
	try {
		await server.listen({ port: PORT, host: HOST });
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

start();
