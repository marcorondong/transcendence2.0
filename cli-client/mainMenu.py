# from menu.apiHandlers import guestLogin
from menu.drawMenu import menuLoop
from window.windowColors import setColors
import curses
from menu.logger import myLogger
from utils.player import Player


user = Player()


def mainMenu(stdscr):
    setColors(stdscr, curses.COLOR_WHITE, curses.COLOR_BLACK)
    menuLoop(
        stdscr,
        "Main menu: ",
        ["Random Game", "Register", "nonexistent menu option", "Login Filip"],
        user,
    )
    myLogger.debug(f"my name is {user.username}")


if __name__ == "__main__":
    myLogger.debug("First function called")
    curses.wrapper(mainMenu)
    # curses.wrapper(main) initializes the screen and handles cleanup
