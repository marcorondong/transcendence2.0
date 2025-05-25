class Player:
    username: str
    access_token: bool

    def __init__(self):
        self.username = "<GUEST>"
        self.access_token = False

    def set_username(self, username: str) -> None:
        self.username = username
