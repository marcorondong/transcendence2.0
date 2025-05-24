from websockets.sync.client import connect
import json
import curses
import ssl
from websockets.sync.client import connect

HOST = "localhost" #TODO read this from proper file like 10.12.5.7
PORT = "8080"
ROUTE = "/pong-api/pong/singles"
WS_ROUTE = f"wss://{HOST}:{PORT}{ROUTE}"
ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFlNDA0YmU5LTFjN2QtNDJiMS04ODdmLWQ4NDMyZmRlZWVkOCIsIm5pY2tuYW1lIjoic2hha2lyYSIsImlhdCI6MTc0NzU5Nzg0MSwiZXhwIjoxNzU1MzczODQxfQ.Kt_SgeRxIR39ROj2q8qbPqyN0kqNCs9RF-27h56jQDU.gZqxhwIdiuhvdnxGTFzXSVFtwA7BDpqIq8S1Rw6trUA"

ssl_context = ssl._create_unverified_context() #Otherwise python will not let you bypass self signed certificate

custom_headers = {
	"Cookie": f"access_token={ACCESS_TOKEN}"
}

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
	with connect(WS_ROUTE, close_timeout=0.1, ping_interval=None, ssl=ssl_context, additional_headers=custom_headers) as websocket:
		stdscr.addstr(0, TAB_SIZE, CONTROLS_TUTORIAL)
		stdscr.refresh()
		while True:
			move = getMove(stdscr)
			if move == "quit":
				websocket.close()
				break
			if move != "none":
				sendMove(websocket, move)
