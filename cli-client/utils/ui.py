import curses

MAX_INPUT_LENGTH = 128


def secret_typing(screen: curses.window) -> str:
    password = ""
    while True:
        one_char = screen.getch()
        if one_char == ord("\n"):
            break
        screen.addstr("*")
        password += chr(one_char)
        screen.refresh()
    return password


class UI:

    def get_prompt(prompt_title: str, screen: curses.window, starting_line=0) -> str:
        """Return user prompt visible typing

        Args:
            screen (curses.window): _description_
            starting_line (int, optional): Line number. Defaults to 0.

        Returns:
            str: user input
        """
        curses.echo()
        prompt = f"Enter {prompt_title}:"
        screen.addstr(starting_line, 0, prompt)
        screen.refresh()
        user_input_bytes = screen.getstr(starting_line, len(prompt), MAX_INPUT_LENGTH)
        curses.noecho()

        return user_input_bytes.decode()

    def get_secret_prompt(
        prompt_title: str, screen: curses.window, starting_line=0
    ) -> str:
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
        screen.addstr(starting_line, 0, prompt, curses.A_STANDOUT)
        screen.refresh()
        return secret_typing(screen)
