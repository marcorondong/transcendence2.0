# from menu.apiHandlers import guestLogin
from menu.drawMenu import menuLoop
from window.windowColors import setColors
import curses
from menu.logger import myLogger
from utils.player import Player
from utils.ui import UI

user = Player()


def mainMenu(stdscr):
    UI.set_screen(stdscr)
    setColors(stdscr, curses.COLOR_WHITE, curses.COLOR_BLACK)
    menuLoop(
        stdscr,
        "Main menu: ",
        [
            "Random Game",
            "Register",
            "nonexistent menu option",
            "Login",
            "Auto login",
        ],  # it took me a lot of time to realize this and menuItems from menuItems.py are not same
        user,
    )
    myLogger.debug(f"my name is {user.username}")


if __name__ == "__main__":
    myLogger.debug("First function called")
    curses.wrapper(mainMenu)
    # curses.wrapper(main) initializes the screen and handles cleanup
