import Fastify from "fastify";
import { Bot } from "./bot"; // Assuming your Bot class is properly defined

const fastify = Fastify({ logger: true });

// Define the game request schema (optional but recommended for validation)
const gameRequestSchema = {
  type: "object",
  required: ["host", "port", "side", "difficulty"],
  properties: {
    host: { type: "string" },
    port: { type: "string" },
    side: { type: "string", enum: ["left", "right"] },
    difficulty: { type: "string", enum: ["easy", "medium", "hard", "insane"] },
    roomId: { type: "string" }, // Optional field
  },
};

// Route to handle game requests
fastify.post("/start-game", { schema: { body: gameRequestSchema } }, async (request, reply) => {
  const gameRequest = request.body as any;

  try {
    new Bot(gameRequest); // Launch a bot for the given request
    reply.code(200).send({ message: "Bot started successfully", gameRequest });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ error: "Failed to start bot" });
  }
});

// Start the Fastify server
const start = async () => {
  try {
    await fastify.listen({ port: 6969, host: "0.0.0.0" });
    console.log("Server running on http://localhost:6969");
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
