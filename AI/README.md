## containerized game + AI server from terminal (recommend)

### 1. Start the game service in the directory ssg/pong-api with 
```
docker-compose up
```
1.5 open the game in your browser

### 2. start the AI server in directory AI with
```
npx nodemon
```
  
### 3. send a POST request to localhost:6969/start-game. 

The request body is described in AI/src/gameRequestSchema.ts

Host and port is where the ssg-pong service is running

{
    host: { type: "string" },
    port: { type: "string" },
    side: { type: "string", enum: ["left", "right"] },
    difficulty: { type: "string", enum: ["easy", "medium", "hard", "insane"] },
    roomId: { type: "string" }
}

### 4. Creates a Bot instance with the provided parameters.

The bot connects to the WebSocket at host:port to play the game



## containerized game + containerized AI server (don't recommend at the moment)

### 1. specify a docker-network for the two containers
```
docker network create my_shared_network
```
Add this to the docker-compose of both ervices:
```
services:

  #[service specification]

    networks:
      - my_shared_network

networks:
  my_shared_network:
    external: true
```

I don't recommend this because we will have later all services in the same docker-compose.yml and same network

I just did it to see that my AI containerization works.

### 2. start both services with their own docker-compose

they can connect to each other using the external network.

### 3. and 4. same as above