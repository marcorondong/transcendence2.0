## subject conform AI

### 1. endpoint for frontend: https://localhost:8080/ai-api/game-mandatory

Method: `POST`

Request body:

```json
{
  "roomId": { type: "uuid" }, //room id where the human user is
  "difficulty": { type: "string", enum: ["easy", "normal", "hard"] },
}
```

only available to logged in users

### 2. nginx will authenticate the request and forward it to backend bot http://ai-bot:6969/ai-api/game-mandatory

### 3. this will open a websocket to backend pong

ws is hidden completely from frontend
  
### 4. see also [Swagger docs](http://localhost:6969/ai-api/documentation) while we are in development
