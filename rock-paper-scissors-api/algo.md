## Client 1 POV

1. Send websocket get to play game 
	1. Json needs to include player id, optional gameroomid 
2. Wait until server return message that game room is ready 
3. Send one move. Maybe even block client messagin until server decide winner 
4. Recive message who won 


## Client 2 POV
1. Send websocket get to play game 
2. Server should immediatyl return message that game room is ready
3. Send one move 
4. Recive message who won 


## Server POV
1. Register player 1 (client 1) and put him in room
2. Register player 2 (client 2) and put him in room 
3. Send to both player that game room is ready and that is waiting for move of both 
4. Recive player 1 move 
5. Recive player 2 move 
6. Calculate Winner 
7. Store game data in some kind of json would be best (who against who and what was result) (for other microservices to store data or similar)
8. Send results to both players 
9. server disconnect both players and remove them from map or whatever