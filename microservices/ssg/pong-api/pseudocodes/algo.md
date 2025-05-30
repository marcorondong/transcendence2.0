## Pong game server POV
1. Player 1 joins (left player)
2. Player 2 joins (right player)
3. On each client message server should update position of that player paddle.
4. While game is running server is sending 60 frames per second. Each frame send:
    * left paddle 
    * right paddle 
    * ball
    * score 
    * some additional info (knockout stage, game phase etc)


## Client POV and controls
1. Once connected via websocket client is sending json with either:

```json
{"move":"up"}
```
or 
```json
{"move":"down"}
```
2. Server in next frame should send updated paddle position

### Paddle movement blocking
User can modify paddle y position in wanted direction only if there is at least 10% of paddle left inside the field after applied new move.
That means that position y of paddle can be maximum = top edgeY + 45% of paddle height


## Game collision logic 
Both paddle and ball have their hit boxes. Aka area around center that register hit.
Values are defined in `pong-api/config.ts`
### Paddle
For paddle it is +- 1 (defined as `height` in `pong-api/config.ts`) on y axis. It has multiple points along on this line that triggers and register collision. 
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
