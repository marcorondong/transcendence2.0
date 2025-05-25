import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { gameRoute, debugRoute, healthRoute } from "./gameRoutes";
import axios from "axios";
import { botConfig } from "./config";

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
	routePrefix: "/ai-api/documentation",
	uiConfig: {
		docExpansion: "list",
		deepLinking: false,
	},
});

fastify.register(gameRoute, { prefix: "/ai-api" });
fastify.register(debugRoute);
fastify.register(healthRoute);

fastify.ready().then(() => {
	console.log(fastify.swagger());
});

async function registerBotUser() {
	try {
		const botUser = await axios.post("http://users:3000/api/users/", {
			email: botConfig.email,
			username: botConfig.name,
			nickname: botConfig.name,
			password: botConfig.password,
		});
		console.log("Bot user created: ", botUser.status);
	} catch (error: any) {
		console.log("Error creating bot user: ", error.response.data);
	}
}

const start = async () => {
	try {
		await registerBotUser();

		await fastify.listen({ port: 6969, host: "0.0.0.0" });
	} catch (error) {
		fastify.log.error(error);
	}
};
start();
