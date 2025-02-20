## Pong game serverPOV
1. Player 1 joins (left player for example)
2. Player 2 joins (right player)
3. On each clinet message server should update positon of that player paddle.
4. While game is running server is sending 60 frames per second 
	Each frame send:
	 * left paddle postion (x, y)
	 * right paddle postion (x, y)
	 * ball postion (x, y)
5. Display and update score (maybe seperate json not sure)


## Client POV 
1. Once conected via websocket client is sending json whith either {"move":"up"} or {"move" "down"}
2. Server in next frame should send updated paddle position (maybe client on his frontend can in exactly same frame update his paddle. Opponet will see this only in next frame?)
