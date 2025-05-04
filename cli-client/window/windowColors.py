import curses

def setColors(window, textColor, backgroundColor):
	curses.init_pair(1, textColor, backgroundColor)
	window.bkgd(' ', curses.color_pair(1) | curses.A_BOLD)