## How It Works:

### 1. Send a POST request to localhost:6969/start-game with request body as JSON:
  
    host: { type: "string" },
    port: { type: "string" },
    side: { type: "string", enum: ["left", "right"] },
    difficulty: { type: "string", enum: ["easy", "medium", "hard", "insane"] },
    roomId: { type: "string" },

host and port belonging to a room where a player requested a match against AI.
  
### 2. Validates incoming requests using Fastify’s schema validation.

properties "host", "port", "side", "difficulty" are mandatory to launch a new AI opponent.

"roomId" is optional and currently the bot doesnt need it.

### 3. Creates a Bot instance with the provided parameters.

the bot connects to the WebSocket at host:port to play the game
