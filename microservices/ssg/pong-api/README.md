# Docs pong-api
## Intro
Pong-api is microservice that:
* handles incoming connection on websocket, 
* let authorized player to play 3 different game modes: singles, doubles and tournament.
* stores result of games against other players in database, in addition to that tournament is stored on testing Avalanche blockchain too
* have spectator mode



## User Manual
### How to connect
If Pong-api is behind nginx, websocket protocol is secure  `wss` otherwise it is not secure `ws`. In our case nginx is configured that way that anything that is for pong-api is forwarded to container for it. So most basic form of connecting to pong api is: `WEBSOCKET_PROTOCOL://IP:PORT/pong-api/pong/MATCH_TYPE?QUERY` where: 
* WEBSOCKET_PROTOCOL -> `wss | ws`
* IP -> ip address of nginx or pong api (example: `localhost`, `10.12.6.1`, etc )
* PORT -> port of pong-api or frontend (example: `8080`, `3010`)
* MATCH_TYPE -> `singles | doubles | tournament`
#### Queries
Queries are optional and send after `?` with `KEY`=`VALUE`
##### roomId
In match type of `singles` and `doubles` client can send query with key `roomId` valid values for this keys are (defined in `pong-api/src/utils/zodSchema.ts`): 
* `public` -> player joins random public room either as HOST(first player) or GUEST (all players that are not HOST)
* `private` -> player become HOST of room where only player who knows roomId can join
* `UUID_OF_ROOM_YOU_WANT_TO_JOIN` -> player joins as GUEST to room of HOST. Example is (`0f2217d6-a378-484e-98a2-4c07a377f5c5`)

If noting is specified it is same as sending `?roomId=public`

#### tournamentSize
In match type tournament client can send query with key `tournamentSize`. valid values for this keys are (defined in `pong-api/src/utils/config.ts`) are `4 | 8 | 16`. 

If noting is specified it is same as sending `?tournamentSize=4`

#### Valid examples
* `wss://localhost:8080/pong-api/pong/singles` -> most basic
* `wss://localhost:8080/pong-api/pong/singles?roomId=private` -> SINGLE PRIVATE HOST
* `wss://localhost:8080/pong-api/pong/singles?roomId=0f2217d6-a378-484e-98a2-4c07a377f5c5` -> SINGLE PRIVATE GUEST
* `wss://localhost:8080/pong-api/pong/tournament` -> TOURNAMENT with size 4
* `wss://localhost:8080/pong-api/pong/tournament?tournamentSize=8` -> TOURNAMENT with size 8
* `wss://localhost:8080/pong-api/pong/doubles` -> DOUBLES basic

### Possible errors on websocket
| Closing Code on ws  | Error Message                          | Possible Solution                                      |
|--------------|----------------------------------------|--------------------------------------------------------|
| 1008     | Unauthorized | Invalid JWT token, no token is sent or Auth-api is down.|
| 1008  | Unknown match type  | not supported game mode received on server side                                 |
| 1008  | You are already in a game Room | Player with that JWT already is on pong-api. First connection is not closed. Client should close (first connection) on it own or wait until game is over/player is kicked in order to connect with "second"     |
| NOT_CLOSED          | Invalid move| wrong format of control is sent. Check JSON key and value, make sure no other info is sent  |
| NOT_CLOSED       | It is not zod Error, but probably empty move sent:{ERR}        | Likely empty move sent. Or something went terribly wrong on backed. [Sekula](https://github.com/Sekula34) to blame in second case |
| 1008          | Bot cannot join tournament, You can report us to the Office for Robot Rights in Vienna | Pay to [benszilas](https://github.com/benszilas) and [Sekula](https://github.com/Sekula34) to implement feature where Bot can play tournament  |
| NOT_CLOSED      | Size _tournamentSize_ is not valid, Switch to default value _value_$  | Invalid tournament size sent but it is switched to default value|
| 1008          | Room with id not found        | Player want to be guest in room where HOST already left room. Or you are just evaluator who now tries really hard to crash us on backend, which is not nice but you will need to try harder than this  |
| NOT_ON_LIST          | "**f\*ck**, **sche\*se** , **JEB\*TE** SEKULA i njegove gluposti"| PANIC, call or try to find (probably hiding in Croatia) Sekula and explain him why he is stupid.|



### Controls
1. Once connected via websocket client is sending json with either:

```json
{"move":"up"}
```
or 
```json
{"move":"down"}
```
2. Server in next frame should send updated paddle position


# More Info about backend

## Overall server POV
1. Lobby phase
2. Game phase 
3. On each client message server should update position of that player paddle.
4. While game is running server is sending 60 frames per second. Each frame send:
    * left paddle 
    * right paddle 
    * ball
    * score 
    * some additional info (knockout stage, game phase etc)
## Game mechanics and elements logic 
Both paddle and ball have their hit boxes. Aka area around center that register hit.
Values are defined in `pong-api/config.ts`
### Paddle
For paddle it is +- 1 (defined as `height` in `pong-api/config.ts`) on y axis. It has multiple points along on this line that triggers and register collision. 

### Paddle movement blocking
User can modify paddle y position in wanted direction only if there is at least 10% of paddle left inside the field after applied new move.
That means that position y of paddle can be maximum = top edgeY + 45% of paddle height

### Ball
for ball it is area 0.25 around center of circle  
If ball hit UP_OUT_LINE or DOWN_OUT_LINE on field `x` direction stay same but `y` is reversed
If ball hit LEFT_OUT_LINE or RIGHT_OUT_LINE it is considered goal for opposite side.

### Critical area 
critical area are points of field where make sense to check if ball hit something (edge of field or paddle). 
Critical should be in my opinion = `(ball radius + (MovementVector * SOME_X_THAT_MAKE_SENSE=5))` in this example +- 0.75 diff 

## Bouncing pseudocode
```pseudocode
IF BALL in critical area 
	IF BALL HIT SOMETHING:  
      bounce 
return  
```


## Tournament match making
*  Class that stores all tournaments in map by id
* It is important to distinguish in those maps sizes of tournament. We will support 4, 8 and 16 players for now
* There are active tournaments; one that already have all players and started. And There are lobby tournaments; ones that are waiting for players 
* class manages all tournaments and as soon as one is done; finished it will store result and clean all Pong rooms of that tournaments 

## Tournament joiner logic 
```pseudo code
1. new player connects
2. Check query on how many players in tournament he wants (4, 8 or 16); default is 4 players
3. Look at tournaments in map.
	1. If there is non active tournament with correct size 
		join that player to that tournament
	2. else 
		create tournament with that size and put that player in that tournament 
```

## Singles match joiner public
``` pseudo code
1. new player connect
2. Look for room in map 
	1. if there is public lobby room 
		join player to that room
	2. else 
		create room and put player in that one
```

## Session
Session is phase from player connecting with websocket until connection is close for whatever reason. Aka anything that happens between events `websocket.connection.on("open")` until event `websocket.connection.on("close")`. Each player is immediately put in `room`. There is two main phases of each `room`: 
* Lobby phase 
* Match phase

### Lobby Phase 
Player who just opens websocket with pong-api is in Lobby phase until required number of players (connection). This number depend on which type of room player joined. It is either 2, 4 or total number of players in tournament. Each time player joins all players who was in room before that one will get message that new player comes. If room require for example 6 players and there is 3 players and one left, other two will get message that one player left. There is no penalty for player who close connection during this phase

### Match Phase 
As soon as Lobby have required number of players. Match phase begins. From this point on server is sending frame description in json format 60 times per second. Match is played until time runs out. If it is draw game is going in overtime. In overtime phase each paddle hit with ball shrinks the paddle by factor defined in `config.ts`. Overtime ends as soon as one player score goal and becomes winner. This technique prevents never ending game since paddle will not exist due to shrinking. Just be good enough and you will not depend on luck in overtime. How hard could it be?!. If player close connection in this phase; That player is losing with score 3 - 0 no matter what what score before that.


## Match Types/Game modes
There is three main type of games: 
* singles (1 vs 1)
* doubles (2 vs 2)
* knock-out tournament

### Private and public room
In order to play singles or doubles player can choose between public and private room. Public room joins player in lobby with random opponent in chosen game mode. Private room is created with specific query that contains `roomId=private` with this player become HOST and is put in lobby to which opponent can join only if it provides `roomId=roomIdOfHOST`. This is not supported in tournament mode.

### Tournament
Tournament start as Lobby phase until required number of players is there. As soon as All players are there it start. Once the round is finished winner continue with same connection to lobby where he waits for other matches to finish. Loser is kicked out. The process of LOBBY with N players->MATCH->LOBBY with N/2 players(winners) continue until there is only 1 player left. All result of matches are stored on blockchain.  
