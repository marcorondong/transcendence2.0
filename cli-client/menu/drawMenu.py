import curses
from menu.menuItems import menuItems, pressAnyKey, TAB_SIZE, BACK_BUTTON
from menu.logger import myLogger
from utils.player import Player


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
            items: The list of items (as strings) to display. possible items see menuItems.py
            position: The current position of the cursor.
    """

    stdscr.clear()
    curses.curs_set(2)

    stdscr.addstr(0, 0, title)
    stdscr.addstr(items.__len__() + 1, TAB_SIZE * 2, BACK_BUTTON)

    for i, line in enumerate(items):
        stdscr.addstr(i + 1, TAB_SIZE * 2, line)

    stdscr.move(position, TAB_SIZE)
    stdscr.refresh()


def drawCursor(stdscr, position):
    """
    Puts the cursor to (position, TAB_SIZE) without refreshing the menu items.
    Args:
            stdscr: The standard screen object.
            position: The current position of the cursor.
    """

    stdscr.move(position, TAB_SIZE)
    stdscr.refresh()


def callHandlerFunction(stdscr, selectedItem, user: Player):
    """_summary_ Calls function of selected item

    Args:
        stdscr (_type_): _description_
        selectedItem (_type_): _description_
        user (Player): class that have all player/user data

    Returns:
        _type_: _description_
    """
    stdscr.clear()
    curses.curs_set(0)
    myLogger.debug(f"{selectedItem} is selected")
    handler = menuItems.get(
        selectedItem, pressAnyKey
    )  # if selectedItem has no defined handler, press any key to return to menu
    handler(stdscr, user)


def menuLoop(stdscr, title, items, user: Player):
    """
    draws menu and waits for user input.
    Args:
            stdscr: The standard screen object.
            title: The title of the menu.
            items: The list of items (as strings) to display. see also menuItems.py
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
            if position == menuLength:  # last position is the "Back" button
                break
            else:
                selectedItem = items[position - 1]
                callHandlerFunction(stdscr, selectedItem, user)
                drawMenu(
                    stdscr,
                    f"{user.get_personal_greeting()} {title}",
                    items,
                    position,
                )
        # elif key == 27:  # ESC key
        # 	confirmExit()
