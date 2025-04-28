import curses

def getWindowSize(stdscr):
	"""
	Get the current size of the terminal window.
	
	Returns:
		tuple: A tuple containing the number of rows and columns (height, width).
	"""
	height, width = stdscr.getmaxyx()
	return height, width

def printWindowSize(stdscr):
	"""
	Print the current size of the terminal window.
	"""
	size = getWindowSize(stdscr)
	if size:
		height, width = size
		stdscr.addstr(0, 0, f"Window size: {height} rows, {width} columns")
	else:
		stdscr.addstr(0, 0, "Unable to get window size.")

def main(stdscr):
	"""
	Main function to initialize curses and display window size.
	exit loop with Ctrl+C
	"""
	while True:
		stdscr.clear()
		printWindowSize(stdscr)
		stdscr.refresh()

curses.wrapper(main)