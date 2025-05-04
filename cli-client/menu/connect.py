from websockets.sync.client import connect
import json
import curses

HOST = "localhost"
PORT = "3010"
ROUTE = "/pong-api/pong"
WS_ROUTE = f"ws://{HOST}:{PORT}{ROUTE}"

TAB_SIZE = 2
CONTROLS_TUTORIAL="Use 'w' to go up with paddle, 's' to go down with paddle, 'q' to quit. Look at browser; rendering is not implemented in cli yet."

moveMapping = {
	ord("w") :"up",
	ord("s") :"down",
	ord("q") :"quit",
}

def sendMove(websocket, move):
	data = {"move": move}
	websocket.send(json.dumps(data))

def getMove(stdscr):
	move = stdscr.getch()
	return moveMapping.get(move, "none")

def client(stdscr):
	with connect(WS_ROUTE, close_timeout=0.1, ping_interval=None) as websocket:
		stdscr.addstr(0, TAB_SIZE, CONTROLS_TUTORIAL)
		stdscr.refresh()
		while True:
			move = getMove(stdscr)
			if move == "quit":
				websocket.close()
				break
			if move != "none":
				sendMove(websocket, move)
