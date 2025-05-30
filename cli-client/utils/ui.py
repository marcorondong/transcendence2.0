import curses

MAX_INPUT_LENGTH = 128


def delete_char_from_screen(screen: curses.window):
    y, x = screen.getyx()
    screen.move(y, x - 1)
    screen.delch()
    screen.refresh()


def secret_typing(screen: curses.window) -> str:
    password = ""
    while True:
        one_char = screen.getch()
        if one_char == ord("\n"):
            break
        elif one_char in (curses.KEY_BACKSPACE, 127, 8):
            if len(password) > 0:
                password = password[:-1]
                delete_char_from_screen(screen)
        else:
            screen.addstr("*")
            password += chr(one_char)
            screen.refresh()
    return password


class UI:

    screen: curses.window = None

    @classmethod
    def set_screen(cls, scr: curses.window):
        cls.screen = scr

    @classmethod
    def get_prompt(cls, prompt_title: str, starting_line=0) -> str:
        """Return user prompt visible typing

        Args:
            screen (curses.window): _description_
            starting_line (int, optional): Line number. Defaults to 0.

        Returns:
            str: user input
        """
        curses.echo()
        prompt = f"Enter {prompt_title}:"
        cls.screen.addstr(starting_line, 0, prompt)
        cls.screen.refresh()
        user_input_bytes = cls.screen.getstr(
            starting_line, len(prompt), MAX_INPUT_LENGTH
        )
        curses.noecho()

        return user_input_bytes.decode()

    @classmethod
    def get_secret_prompt(cls, prompt_title: str, starting_line=0) -> str:
        """Return user prompt but it is not visible while typing.\n
        It shows "*" instead of real input

        Args:
            screen (curses.window): _description_
            starting_line (int, optional): _description_. Defaults to 0.

        Returns:
            str: secret input like password
        """
        curses.noecho()
        prompt = f"Enter {prompt_title}:"
        cls.screen.addstr(starting_line, 0, prompt, curses.A_STANDOUT)
        cls.screen.refresh()
        return secret_typing(cls.screen)

    @classmethod
    def log_notification(cls, notification: str, starting_line=0) -> None:
        notification_len = len(notification)
        if notification_len <= 0:
            return
        height, width = cls.screen.getmaxyx()
        x = width - notification_len
        cls.screen.addstr(starting_line, x, notification, curses.color_pair(2))
        cls.screen.refresh()

    @classmethod
    def log_error(cls, notification: str, starting_line=2) -> None:
        height, width = cls.screen.getmaxyx()
        x = width - len(notification)
        cls.screen.addstr(starting_line, x, notification, curses.color_pair(3))
        cls.screen.refresh()
