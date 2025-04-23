from websockets.sync.client import connect
import json

HOST = "localhost"
PORT = "3010"
ROUTE = "/pong/"
WS_ROUTE = f"ws://{HOST}:{PORT}{ROUTE}"

TAB_SIZE = 2
CONTROLS_TUTORIAL="Use 'w' to go up with paddle, 's' to go down with paddle, 'q' to stop. Look at browser; rendering is not implemented in cli yet."

move_mapping = {
	"w":"up",
	"s":"down",
	"q":"stop",
}

def send_move(websocket, move):
	data = {"move": move}
	websocket.send(json.dumps(data))

def get_move(stdscr):
	move = stdscr.getkey()
	if move in move_mapping:
		return move_mapping[move]
	else:
		return "none"

def client(stdscr):
	with connect(WS_ROUTE) as websocket:
		stdscr.addstr(0, TAB_SIZE, CONTROLS_TUTORIAL)
		stdscr.refresh()
		while True:
			move = get_move(stdscr)
			if move == "stop":
				#FIXME this does not work how i want i to. It should stop immediately but it does not 
				#print("We should break")
				return
			send_move(websocket, move)
