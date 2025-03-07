## Create pong Room that expands session ROOM with Ping Pong game 
1. seesion room waits until there is two players
2. Once it have two players (two wss clients) it creates and starts game 


## Private and public room
Each session room is either public or private. Public room is one where server randomly connects clients. With criteria odd client create room and even client joins room that is waiting longest for match. Private room in which server does not put random client, and client need to join with gameId querry.


##

## Joining and creating auto rooms 
1. Player sends querry to server
2. If querry does not contain roomId
	1. Check if there is public rooms that waits for players
		1. yes 
			1. Join that room (as right player probably)
		2. no 				
			1. createRoom with randomId
			2. put that player in room (as left player probably)
	return 
3. else if querry does contain roomId
	1. if that room exist 
		joinThatRoom 
	2. else 
		1. createRoom wiht random id 
		2. put that player in room
	return 
