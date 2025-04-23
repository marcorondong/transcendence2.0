# from menu.apiHandlers import guestLogin
from menu.drawMenu import menuLoop
from window.windowColors import setColors
import curses

def main(stdscr):
	setColors(stdscr, curses.COLOR_BLACK, curses.COLOR_BLACK)
	guestUser = "guest"
	menuName = "Welcome " + guestUser + "! Main menu:"
	menuLoop(stdscr, menuName, [
		"Random Game",
	])
	
if __name__ == "__main__":
	curses.wrapper(main)
		# curses.wrapper(main) initializes the screen and handles cleanup