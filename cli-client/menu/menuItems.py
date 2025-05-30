from menu.connect import client, TAB_SIZE
from menu.connect import register_user
from utils.player import Player
from utils.ui import UI
import curses

BACK_BUTTON = "Back"


def randomGame(user: Player):
    """
    get a random game
    """
    client(user.get_custom_headers())
    UI.screen.nodelay(False)


def register(user: Player):
    """
    register a new user
    """
    UI.screen.clear()
    UI.screen.refresh()

    line = 0
    email = UI.get_prompt("email", line)
    line += 1
    nickname = UI.get_prompt("nickname", line)
    line += 1
    username = UI.get_prompt("username", line)
    line += 1
    password = UI.get_secret_prompt("password", line)

    register_user(email, nickname, username, password)
    UI.log_notification("Press Enter to continue", 1)
    UI.screen.getch()


def login(user: Player) -> None:
    """
    login an existing user and open the main menu
    """
    line = 0
    username = UI.get_prompt("username", line)
    line += 1
    password = UI.get_secret_prompt("password", line)
    line += 1
    if user.log_user(username, password):
        UI.log_notification("You are logged In")
        user.set_username(username)
    UI.log_notification("Press Enter to continue", 1)
    UI.screen.getch()
    # return "username"


# TODO remove this. It is auto login for filip account for faster testing
def auto_login(user: Player) -> None:
    """
    login an existing user and open the main menu
    """
    line = 0
    username = UI.get_prompt("username", line)
    line += 1
    password = UI.get_secret_prompt("password", line)
    line += 1

    username = "fseles"
    # UI.screen.addstr(line + 2, 0, f"Username is {username}")
    # UI.screen.addstr(line + 3, 0, f"Password is {password}")
    if user.log_user(username, "A1!aaa"):  # FIXME put real input
        UI.log_notification("You are logged In")
        user.set_username(username)
    UI.log_notification("Press Enter to continue", 1)
    UI.screen.getch()
    # return "username"


def logout(user: Player):
    """
    logout the current user
    """
    user.unset_access_token()
    UI.log_notification("Logged out, Press enter to continue")
    UI.screen.getch()
    # logic later


def pressAnyKey(user: Player):
    """
    prints 'press any key to return to menu' on line 0 of the screen
    refreshes the screen and waits for user input
    """
    UI.screen.clear()
    UI.screen.addstr(0, 0, "Press any key to return to menu")
    UI.screen.refresh()
    UI.screen.getch()
    UI.screen.clear()


menuItems = {
    "Register": register,
    "Login": login,
    "Auto login": auto_login,
    "Logout": logout,
    "Random Game": randomGame,
    "none": pressAnyKey,
}
