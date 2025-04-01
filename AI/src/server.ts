import Fastify from "fastify";
import swagger from "@fastify/swagger";
// import swaggerUi from "@fastify/swagger-ui";
import { Bot } from "./bot";

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

// fastify.register(swaggerUi, {
// 	routePrefix: '/documentation',
// 	uiConfig: {
// 	  docExpansion: 'full',
// 	  deepLinking: false
// 	},
// });

const gameRequestSchema = {
  description: "Connect a new bot opponent to an existing game",
  tags: ["Game"],
  summary: "Creates a bot instance for a game. The bot connects to the game room WebSocket to play.",
  body: {
    type: "object",
    required: ["host", "port", "side", "difficulty"],
    properties: {
      host: { type: "string" },
      port: { type: "string" },
      side: { type: "string", enum: ["left", "right"] },
      difficulty: { type: "string", enum: ["easy", "medium", "hard", "insane"] },
      roomId: { type: "string" },
    },
  },
  response: {
	200: {
	  type: "object",
	  properties: {
		description: { type: "string" },
		gameRequest: {
		  type: "object",
		  properties: {
			host: { type: "string" },
			port: { type: "string" },
			side: { type: "string" },
			difficulty: { type: "string" },
			roomId: { type: "string" },
		  },
		},
	  },
	},
	400: {
	  type: "object",
	  properties: {
		error: { type: "string" },
	  },
	},
	500: {
	  type: "object",
	  properties: {
		error: { type: "string" },
	  },
	},
  },
};

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
