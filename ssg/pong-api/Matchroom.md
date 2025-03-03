## Create pong Room that expands session ROOM with Ping Pong game 
1. seesion room waits until there is two players
2. Once it have two players (two wss clients) it creates and starts game 


## Private and public room
Each session room is either public or private. Public room is one where server randomly connects clients. With criteria odd client create room and even client joins room that is waiting longest for match. Private room in which server does not put random client, and client need to join with gameId querry.
