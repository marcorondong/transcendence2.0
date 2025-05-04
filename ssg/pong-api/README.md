## pong api 
* Server is running on 3010

* Game can be played with link [game](https://localhost:3010/pong-api/ping-pong/)

* optional query arguments are gameId:string, clientType: "spectator" | "player"

* example https://localhost:3010/pong-api/ping-pong?roomId=6b0c4854-d2ce-4625-90b9-95f10bef53f7
* spectator example https://localhost:3010/pong-api/ping-pong?roomId=6b0c4854-d2ce-4625-90b9-95f10bef53f7&clientType=spectator

* DONT forget `&` after each query parameter if there is multiple ones

* if optional query parameter is not specified client will join random room as player
* if optional query parameter gameId is specified, client will join specific room if exist. Either as player or spectator depending on what is specified in query Parameter (default value is player). If roomId does not exist it will create new room if client type is player or will just disconnect client it type is spectator. 
* spectator always need to specify gameId that he wants to watch
