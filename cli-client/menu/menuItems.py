import requests
import curses
from menu.connect import client, TAB_SIZE
from menu.logger import myLogger
from utils.prompt import *
from utils.player import *
from menu.connect import log_in

MAX_USERNAME_LENGTH = 40
MAX_PASSWORD_LENGTH = 128

BACK_BUTTON = "Back"


def randomGame(stdscr, user: Player):
    """
    get a random game
    """
    client(stdscr, user.get_custom_headers())


def register(stdscr, user: Player):
    """
    register a new user
    """
    stdscr.addstr(2, TAB_SIZE, "Registering a new user...")
    # logic later


def login(stdscr: curses.window, user: Player):
    """
    login an existing user and open the main menu
    """
    line = 0
    user_prompt = Prompt("username")
    password_prompt = Prompt("password")
    username = user_prompt.get_prompt(stdscr, line)
    line += 1
    password = password_prompt.get_secret_prompt(stdscr, line)

    user.set_username("f@gmail.com")  # FIXME put real input
    stdscr.addstr(line + 2, 0, f"Username is {username}")
    stdscr.addstr(line + 3, 0, f"Password is {password}")
    user.log_user("A!1aaa")  # FIXME put real input
    stdscr.getch()
    return "username"


def guestLogin(stdscr, user: Player):
    """
    login as a guest user
    """
    stdscr.addstr(2, TAB_SIZE, "Logging in as guest...")
    # logic later
    return "guest"


def logout(stdscr, user: Player):
    """
    logout the current user
    """
    stdscr.addstr(2, TAB_SIZE, "Logging out...")
    # logic later


def pressAnyKey(stdscr, user: Player):
    """
    prints 'press any key to return to menu' on line 0 of the screen
    refreshes the screen and waits for user input
    """
    stdscr.clear()
    stdscr.addstr(0, 0, "Press any key to return to menu")
    stdscr.refresh()
    stdscr.getch()
    stdscr.clear()


menuItems = {
    "Register": register,
    "Login Filip": login,
    # "Login": login,
    "Logout": logout,
    "Random Game": randomGame,
    "Guest Login": guestLogin,
    "none": pressAnyKey,
}
