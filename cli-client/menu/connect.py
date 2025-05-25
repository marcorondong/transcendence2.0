from websockets.sync.client import connect
import json
import curses
import ssl
from websockets.sync.client import connect
import requests
from menu.logger import myLogger
import urllib3
from utils.ui import UI

HOST = "localhost"  # TODO read this from proper file like 10.12.5.7
PORT = "8080"
ROUTE = "/pong-api/pong/singles"
WS_ROUTE = f"wss://{HOST}:{PORT}{ROUTE}"

ssl_context = (
    ssl._create_unverified_context()
)  # Otherwise python will not let you bypass self signed certificate

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


TAB_SIZE = 2
CONTROLS_TUTORIAL = "Use 'w' to go up with paddle, 's' to go down with paddle, 'q' to quit. Look at browser; rendering is not implemented in cli yet."

moveMapping = {
    ord("w"): "up",
    ord("s"): "down",
    ord("q"): "quit",
}


def sendMove(websocket, move):
    data = {"move": move}
    websocket.send(json.dumps(data))


def getMove(stdscr):
    move = stdscr.getch()
    return moveMapping.get(move, "none")


def client(stdscr, user_header: dict[str, str]):
    with connect(
        WS_ROUTE,
        close_timeout=0.1,
        ping_interval=None,
        ssl=ssl_context,
        additional_headers=user_header,
    ) as websocket:
        stdscr.addstr(0, TAB_SIZE, CONTROLS_TUTORIAL)
        stdscr.refresh()
        while True:
            move = getMove(stdscr)
            if move == "quit":
                websocket.close()
                break
            if move != "none":
                sendMove(websocket, move)


# TODO fix check if it was successful
def log_in(username: str, password: str) -> str | bool:
    """log user

    Args:
        user (Player): _description_
        password (str): _description_

    Returns:
        str: access token
    """
    session = requests.Session()
    response = session.post(
        "https://localhost:8080/auth-api/sign-in",
        json={
            "email": username,
            "password": password,
        },
        verify=False,
    )
    if not 200 <= response.status_code < 300:
        UI.log_error(f"Log in fail. Return code {response.status_code}")
        return False
    cookies = session.cookies.get_dict()
    user_access_token = cookies.get("access_token")
    myLogger.debug(f"Code is {response.status_code}")
    return user_access_token


# myLogger.debug(response.cookies)
