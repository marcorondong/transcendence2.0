import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { gameRoutes, healthRoute } from "./gameRoutes";

const fastify = Fastify({ logger: true });

fastify.register(swagger, {
	swagger: {
		info: {
			title: "Game Bot API",
			description: "API for managing bot game sessions",
			version: "1.0.0",
		},
	},
});

fastify.register(swaggerUi, {
	routePrefix: "/documentation",
	uiConfig: {
		docExpansion: "list",
		deepLinking: false,
	},
	uiHooks: {
		onRequest: function (request, reply, next) {
			next();
		},
		preHandler: function (request, reply, next) {
			next();
		},
	},
});

fastify.register(gameRoutes);
fastify.register(healthRoute);

fastify.ready().then(() => {
	console.log(fastify.swagger());
});

const start = async () => {
	try {
		await fastify.listen({ port: 6969, host: "0.0.0.0" });
	} catch (error) {
		fastify.log.error(error);
	}
};
start();
