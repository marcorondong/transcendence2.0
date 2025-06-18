from menu.logger import myLogger
from menu.connect import log_in


class Player:
    username: str
    access_token: str

    def __init__(self):
        """Initial Player class"""
        self.username = "<GUEST USER>"
        self.access_token = ""

    def set_username(self, username: str) -> None:
        """Set username for player

        Args:
            username (str): player username
        """
        self.username = username

    def get_personal_greeting(self) -> str:
        return f"Welcome {self.username}!"

    def set_access_token(self, token: str) -> None:
        self.access_token = token

    def unset_access_token(self) -> None:
        self.access_token = ""
        self.username = "<GUEST>"

    def log_user(self, username: str, password: str) -> bool:
        token = log_in(username, password)
        if token == False:
            return False
        self.set_access_token(token)
        self.set_username(username)
        return True

    def get_custom_headers(self) -> dict[str, str]:
        return {"Cookie": f"access_token={self.access_token}"}

    def is_logged_in(self) -> bool:
        if self.access_token == "":
            return False
        return True
