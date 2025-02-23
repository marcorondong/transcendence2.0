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


## Game collision logic 
Both paddle and ball have their hitboxes. aka area around position.
For paddle it is +- 1 on y axis 
for ball it is area 0.25 around postion 
If ball hit UP or Down on field x direction stay same but y should be reversed
If ball hit left or right it is considered goal.

## Critical area 
critical area are points of field where make sense to check if ball hit something (edge of field or paddle). 
Critical should be in my opinion (ball radius + (MovementVector * SOME_X_THAT_MAKE_SENSE=5) in this example +- 0.75 diff 


## bouncing logic 
1. IF BALL in critical area 
	1. IF BALL HIT SOMETHING 
		bounce 
	return 
2. return 
