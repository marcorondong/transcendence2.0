import requests
import curses

def register(stdscr):
	"""
	register a new user
	"""
	print("Registering a new user...")
	# logic later

def login(stdscr):
	"""
	login an existing user and open the main menu
	"""
	print("Logging in...")
	# logic later
	return "username"

def guestLogin(stdscr):
	"""
	login as a guest user
	"""
	print("Logging in as guest...")
	# logic later
	return "guest"

def logout(stdscr):
	"""
	logout the current user
	"""
	print("Logging out...")
	# logic later

def randomGame(stdscr):
	"""
	get a random game
	"""
	stdscr.addstr(1, 0, "To queue for a random game...")
	stdscr.addstr(2, 0, "click http://localhost:3010/pingpong to visit website")
	pressAnyKey(stdscr)

def pressAnyKey(stdscr):
	"""
	prints 'press any key to return to menu' on line 0 of the screen
	refreshes the screen and waits for user input
	"""
	stdscr.addstr(0, 0, "press any key to return to menu")
	stdscr.refresh()
	stdscr.getch()
	stdscr.clear()

menuItems = {
	"Register": register,
	"Login": login,
	"Logout": logout,
	"Random Game": randomGame,
	"Guest Login": guestLogin,
}