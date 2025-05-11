## containerized game + AI in one mini docker network

### 1. Start the game service container and the AI container in the directory ssg
```
docker-compose up
```
### 2. open the [game](http://localhost:3010/pong-api/ping-pong) in your browser 
  
### 3. send a POST request from [Swagger docs](http://localhost:6969/documentation) or directly to http://localhost:6969/game-mandatory. 

### 4. Creates a Bot instance with the provided parameters.

The bot connects to the WebSocket at localhost:3010 to play the game
