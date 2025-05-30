## Session
Session is phase from player connecting with websocket until connection is close for whatever reason. Aka anything that happens between events `websocket.connection.on("open")` until event `websocket.connection.on("close")`. Each player is immediately put in `room`. There is two main phases of each `room`: 
* Lobby phase 
* Match phase

### Lobby Phase 
Player who just opens websocket with pong-api is in Lobby phase until required number of players (connection). This number depend on which type of room player joined. It is either 2, 4 or total number of players in tournament. Each time player joins all players who was in room before that one will get message that new player comes. If room require for example 6 players and there is 3 players and one left, other two will get message that one player left. There is no penalty for player who close connection during this phase

### Match Phase 
As soon as Lobby have required number of players. Match phase begins. From this point on server is sending frame description in json format 60 times per second. Match is played until time runs out. If it is draw game is going in overtime. In overtime phase each paddle hit with ball shrinks the paddle by factor defined in `config.ts`. Overtime ends as soon as one player score goal and becomes winner. This technique prevents never ending game since paddle will not exist due to shrinking. Just be good enough and you will not depend on luck in overtime. How hard could it be?!. If player close connection in this phase; That player is losing with score 3 - 0 no matter what what score before that.


## Game modes
There is three main type of games: 
* singles (1 vs 1)
* doubles (2 vs 2)
* knock-out tournament

### Private and public room
In order to play singles or doubles player can choose between public and private room. Public room joins player in lobby with random opponent in chosen game mode. Private room is created with specific query that contains `roomId=private` with this player become HOST and is put in lobby to which opponent can join only if it provides `roomId=roomIdOfHOST`. This is not supported in tournament mode.

### Tournament
Tournament start as Lobby phase until required number of players is there. As soon as All players are there it start. Once the round is finished winner continue with same connection to lobby where he waits for other matches to finish. Loser is kicked out. The process of LOBBY with N players->MATCH->LOBBY with N/2 players(winners) continue until there is only 1 player left. All result of matches are stored on blockchain.  
