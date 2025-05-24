# from menu.apiHandlers import guestLogin
from menu.drawMenu import menuLoop
from window.windowColors import setColors
import curses
from menu.logger import myLogger

def mainMenu(stdscr):
	setColors(stdscr, curses.COLOR_WHITE, curses.COLOR_BLACK)
	guestUser = "guest"
	menuName = "Welcome " + guestUser + "! Main menu:"
	menuLoop(stdscr, menuName, [
		"Random Game",
		"Register",
		"nonexistent menu option",
		"Login Filip"
	])

if __name__ == "__main__":
	myLogger.debug("First function called")
	curses.wrapper(mainMenu)
		# curses.wrapper(main) initializes the screen and handles cleanup
