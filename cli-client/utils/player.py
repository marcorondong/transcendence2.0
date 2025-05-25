class Player:
    username: str
    access_token: bool

    def __init__(self):
        """Initial Player class"""
        self.username = "<GUEST>"
        self.access_token = False

    def set_username(self, username: str) -> None:
        """Set username for player

        Args:
            username (str): player username
        """
        self.username = username

    def get_personal_greeting(self) -> str:
        return f"Welcome {self.username}!"
