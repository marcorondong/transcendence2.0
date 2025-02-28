import asyncio
import websockets
import ssl
import json
import readchar

HOST = "localhost"
PORT = "3010"
ROUTE = "/pong/"

WS_ROUTE = f"wss://{HOST}:{PORT}{ROUTE}"

async def send_move(websocket, move):
	data = {"move": move}
	await websocket.send(json.dumps(data))

async def get_move():
	move_mapping = {
		"w":"up",
		"s":"down"
	}
	while True:
		move = await asyncio.to_thread(readchar.readchar)
		if(move in move_mapping):
			return move_mapping[move]
		elif move == "q":
			return "stop"
		else:
			print("Invalid move, press 'w' for up, 's' for down or 'q' for stop")


async def client():
	ssl_context = ssl._create_unverified_context()
	async with websockets.connect(WS_ROUTE, ssl=ssl_context) as websocket:
		while True:
			move = await get_move()
			if move == "stop":
				#FIXME this does not work how i want i to. It should stop immediatyl but it does not 
				print("We should break")
				await websocket.close()
				break
			await send_move(websocket, move)

asyncio.run(client())
