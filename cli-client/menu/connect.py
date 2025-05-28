from menu.logger import myLogger
from utils.ui import UI
from websockets.sync.client import connect
import curses
import json
import requests
import ssl
import time
import urllib3
from cli_config import PONG_SINGLES_URL, LOGIN_URL, REGISTER_URL


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


# TODO THIS is old simpler version
# def client(stdscr, user_header: dict[str, str]):
#     with connect(
#         WS_ROUTE,
#         close_timeout=0.1,
#         ping_interval=None,
#         ssl=ssl_context,
#         additional_headers=user_header,
#     ) as websocket:
#         stdscr.addstr(0, TAB_SIZE, CONTROLS_TUTORIAL)
#         stdscr.refresh()
#         while True:
#             move = getMove(stdscr)
#             if move == "quit":
#                 websocket.close()
#                 break
#             if move != "none":
#                 sendMove(websocket, move)


# TODO This is  chat gpt solution for keydown i am not impressed. It is quite tricky to simulate
# same paddle speed from CLI as it is currently on frontend.
# Possible solution:
# a) we keep this version: Not ideal but closest what I could get to frontend
# b) we keep simpler version above
# c) we keep simpler version above and make frontend more shitty so it does not use this smooth key down as it is now in order to have same paddle speed
# d) Pong-api will limit moves on backend. as of 25.05.2025. What a nice date. It is not implemented any restriction on sending moves on backend
# e) someone who is not Filip do whatever he wants.
def client(stdscr, user_header: dict[str, str]):
    stdscr.nodelay(True)
    paddle_direction = 0  # -1 for up, 1 for down, 0 for no movement
    last_key_time = 0
    key_timeout = 0.2  # seconds to reset paddle direction if no key pressed

    with connect(
        PONG_SINGLES_URL,
        close_timeout=0.1,
        ping_interval=None,
        ssl=ssl_context,
        additional_headers=user_header,
    ) as websocket:
        stdscr.addstr(0, TAB_SIZE, CONTROLS_TUTORIAL)
        stdscr.refresh()

        running = True
        while running:
            start_time = time.time()
            key = stdscr.getch()

            if key != -1:
                last_key_time = time.time()
                if key == ord("q"):
                    running = False
                    websocket.close()
                    break
                elif key == curses.KEY_UP or key == ord("w"):
                    paddle_direction = -1
                elif key == curses.KEY_DOWN or key == ord("s"):
                    paddle_direction = 1
                else:
                    # other keys: do nothing or ignore
                    pass
            else:
                # No key pressed this iteration
                # If timeout exceeded, reset paddle direction (simulate key release)
                if time.time() - last_key_time > key_timeout:
                    paddle_direction = 0

            if paddle_direction != 0:
                move = "up" if paddle_direction == -1 else "down"
                sendMove(websocket, move)

            elapsed = time.time() - start_time
            sleep_time = max(0, (1 / 60) - elapsed)
            time.sleep(sleep_time)


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


def register_user(email: str, nickname: str, username: str, password: str) -> bool:
    """_summary_

    Args:
        email (str): _description_
        nickname (str): _description_
        username (str): _description_
        password (str): _description_

    Returns:
        bool: true if success, false otherwise
    """
    response = requests.post(
        REGISTER_URL,
        json={
            "email": email,
            "nickname": nickname,
            "username": username,
            "password": password,
        },
        verify=False,
    )
    if not 200 <= response.status_code < 300:
        UI.log_error(f"Registering user failed. Return code {response.status_code}")
        return False
    myLogger.debug(f"Code is {response.status_code}")
    myLogger.debug(response.text)
    UI.log_notification("User successfully registered")
    return True


# myLogger.debug(response.cookies)
