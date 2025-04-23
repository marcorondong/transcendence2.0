import curses
from menu.menuItems import menuItems

tab = 2
backButton = "Back"

def cursorUp(stdscr, menuLength, position):
	if position > 1:
		position -= 1
	else:
		position = menuLength
	drawCursor(stdscr, position)
	return position
	
def cursorDown(stdscr, menuLength, position):
	if position < menuLength:
		position += 1
	else:
		position = 1
	drawCursor(stdscr, position)
	return position

def drawMenu(stdscr, title, items, position):
	"""
	Draws the menu on the screen.
	Args:
		stdscr: The standard screen object.
		title: The title of the menu.
		items: The list of items (as strings) to display. possible items see defineMenu.py
		position: The current position of the cursor.
	"""

	stdscr.clear()
	curses.curs_set(2)

	stdscr.addstr(0, 0, title)
	stdscr.addstr(items.__len__() + 1, tab * 2, backButton)

	for i, line in enumerate(items):
		stdscr.addstr(i + 1, tab * 2, line)
		
	stdscr.move(position, tab)
	stdscr.refresh()

def drawCursor(stdscr, position):
	"""
	Draws the cursor on the screen without refreshing the menu items.
	Args:
		stdscr: The standard screen object.
		position: The current position of the cursor.
	"""
	
	stdscr.move(position, tab)
	stdscr.refresh()

def callHandlerFunction(stdscr, selectedItem):
	"""
	Calls the function associated with the selected item.
	"""
	stdscr.clear()
	curses.curs_set(0)
	handler = menuItems[selectedItem]
	handler(stdscr)

def menuLoop(stdscr, title, items):
	"""
	draws menu and waits for user input.
	Args:
		stdscr: The standard screen object.
		title: The title of the menu.
		items: The list of items (as strings) to display. possible items see defineMenu.py
	"""

	menuLength = items.__len__() + 1
	position = 1
	drawMenu(stdscr, title, items, position)
	while True:
		key = stdscr.getch()
		if key == curses.KEY_UP:
			position = cursorUp(stdscr, menuLength, position)
		elif key == curses.KEY_DOWN:
			position = cursorDown(stdscr, menuLength, position)
		elif key == curses.KEY_ENTER or key in [10, 13]:
			if position == menuLength:
				break
			else:
				selectedItem = items[position - 1]
				callHandlerFunction(stdscr, selectedItem)
				drawMenu(stdscr, title, items, position)
		# elif key == 27:  # ESC key
		# 	confirmExit()
