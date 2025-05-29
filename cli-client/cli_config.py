# GENERAL CONFIG
PROTOCOL = "https"
WS_PROTOCOL = "wss"
HOST = "localhost"  # TODO read this from proper file like 10.12.5.7
PORT = "8080"

# pong-api config
PONG_SINGLES_ROUTE = "/pong-api/pong/singles"
PONG_SINGLES_URL = f"{WS_PROTOCOL}://{HOST}:{PORT}{PONG_SINGLES_ROUTE}"

# auth-api config
LOGIN_ROUTE = "auth-api/sign-in"
LOGIN_URL = f"{PROTOCOL}://{HOST}:{PORT}/{LOGIN_ROUTE}"

# users-api config
REGISTER_ROUTE = "auth-api/sign-up"
REGISTER_URL = f"{PROTOCOL}://{HOST}:{PORT}/{REGISTER_ROUTE}"
