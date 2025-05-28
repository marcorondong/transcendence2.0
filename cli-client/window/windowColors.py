import curses


def setColors(window, textColor, backgroundColor):
    curses.init_pair(1, textColor, backgroundColor)
    curses.init_pair(2, curses.COLOR_GREEN, curses.COLOR_BLACK)  # FOR NOTIFICATION
    curses.init_pair(3, curses.COLOR_RED, curses.COLOR_BLACK)  # FOR ERRORS
    window.bkgd(" ", curses.color_pair(1) | curses.A_BOLD)
