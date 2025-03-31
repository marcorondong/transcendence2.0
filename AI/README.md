### How It Works:

## 1. Receives a POST request at localhost:6969/start-game with JSON data like:

{
  "difficulty": "easy",
  "host": "127.0.0.1",
  "port": "3010",
  "side": "right",
  "roomId": "game123"  //optional
}

2. ## Validates incoming requests using Fastify’s schema validation.

host and port are mandatory to launch a new AI opponent

3. ## Creates a Bot instance with the provided parameters.

the bot connects to the game room WebSocket to play the game