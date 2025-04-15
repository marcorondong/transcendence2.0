## containerized game + AI in one mini docker network

### 1. Start the game service container and the AI container in the directory ssg
```
docker-compose up
```
### 2. open the [game](https://localhost:3010/pingpong) in your browser 
  
### 3. send a POST request from [Swagger docs](http://localhost:6969/documentation) or directly to http://localhost:6969/start-game. 

#### request body:

Host : "pong-api" , since that is the game server name in the docker network.

Port : "3010" at the moment for testing.

Side :
"right" if you have opened the game (you are waiting for an AI opponent).
"left" if the game is empty (you connect after the AI).

### 4. Creates a Bot instance with the provided parameters.

The bot connects to the WebSocket at host:port to play the game