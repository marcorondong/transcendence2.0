import requests
import curses
from menu.connect import client, TAB_SIZE
from menu.logger import myLogger
from utils.prompt import *

MAX_USERNAME_LENGTH = 40
MAX_PASSWORD_LENGTH = 128

BACK_BUTTON = "Back"


def randomGame(stdscr):
    """
    get a random game
    """
    client(stdscr)


def register(stdscr):
    """
    register a new user
    """
    stdscr.addstr(2, TAB_SIZE, "Registering a new user...")
    # logic later


def login(stdscr: curses.window):
    """
    login an existing user and open the main menu
    """
    line = 0
    user_prompt = Prompt("username")
    password_prompt = Prompt("password")
    username = user_prompt.get_prompt(stdscr, line)
    line += 1
    password = password_prompt.get_prompt(stdscr, line)

    stdscr.addstr(line + 2, 0, f"Username is {username}")
    stdscr.addstr(line + 3, 0, f"Password is {password}")
    stdscr.getch()
    # line_number_y = 0
    # curses.echo()
    # stdscr.clear()

    # greeting = "Enter username: "
    # password_prompt = "Enter password: "
    # stdscr.addstr(line_number_y , 0, "Logging in...")
    # stdscr.addstr(2, 0, greeting)
    # stdscr.refresh()
    # username_bytes = stdscr.getstr(2, len(greeting), MAX_USERNAME_LENGTH)  # Wait for user input
    # username = username_bytes.decode()

    # stdscr.addstr(4, 0, f"Hello, {username}!")
    # stdscr.addstr(7, 0, password_prompt)
    # password_bytes = stdscr.getstr(7, len(password_prompt), MAX_PASSWORD_LENGTH)
    # stdscr.getch()
    # password = password_bytes.decode()
    # stdscr.addstr(8, 0, f"Password is: {password}")

    # stdscr.addstr(7, 0, "Press Enter to go back to main menu")
    # stdscr.getch()
    # stdscr.refresh()
    # curses.noecho()

    return "username"


def guestLogin(stdscr):
    """
    login as a guest user
    """
    stdscr.addstr(2, TAB_SIZE, "Logging in as guest...")
    # logic later
    return "guest"


def logout(stdscr):
    """
    logout the current user
    """
    stdscr.addstr(2, TAB_SIZE, "Logging out...")
    # logic later


def pressAnyKey(stdscr):
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
