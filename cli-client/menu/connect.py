from websockets.sync.client import connect
import json
import curses

HOST = "localhost"
PORT = "3010"
ROUTE = "/pong/"
WS_ROUTE = f"ws://{HOST}:{PORT}{ROUTE}"

TAB_SIZE = 2
CONTROLS_TUTORIAL="Use 'w' to go up with paddle, 's' to go down with paddle, 'q' to quit. Look at browser; rendering is not implemented in cli yet."

move_mapping = {
	ord("w") :"up",
	ord("s") :"down",
	ord("q") :"quit",
}

def send_move(websocket, move):
	data = {"move": move}
	websocket.send(json.dumps(data))

def get_move(stdscr):
	move = stdscr.getch()
	return move_mapping.get(move, "none")

def client(stdscr):
	with connect(WS_ROUTE, close_timeout=0.1, ping_timeout=0.1) as websocket:
		stdscr.addstr(0, TAB_SIZE, CONTROLS_TUTORIAL)
		stdscr.refresh()
		while True:
			move = get_move(stdscr)
			if move == "quit":
				websocket.close()
				break
			if move != "none":
				send_move(websocket, move)