## subject conform AI

### 1. endpoint for frontend: https://localhost:8080/ai-api/game-mandatory?roomId={uuid}

### 2. nginx will authenticate the request and on success forward it to http://ai-bot:6969/ai-api/game-mandatory

### 3. this will open a websocket on the backend to http://pong-api:3010/pong-api/pong 

(ws is hidden completely from frontend)
  
### 4. see also [Swagger docs](http://localhost:6969/ai-api/documentation)
