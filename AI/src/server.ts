import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { Bot } from "./bot";
import { gameRequestSchema } from "./gameRequestSchema";

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
	routePrefix: '/documentation',
	uiConfig: {
	  docExpansion: 'full',
	  deepLinking: false
	},
});

fastify.post("/start-game", { schema: gameRequestSchema }, async (request, reply) => {
  const gameRequest = request.body as object;
  if (!gameRequest) {
	return reply.code(400).send({ error: "Invalid game request" });
  }

  try {
    new Bot(gameRequest);
    reply.code(200).send({ description: "Game successfully started", gameRequest });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ error: "Failed to start bot" });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: 6969, host: "0.0.0.0" });
    console.log("Server running on http://localhost:6969");
  } catch (error) {
    fastify.log.error(error);
  }
};

start();
