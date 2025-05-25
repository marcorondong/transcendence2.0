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


class Prompt:
    name: str

    def __init__(self, prompt_name: str):
        self.name = prompt_name

    def get_prompt(self, screen: curses.window, starting_line=0) -> str:
        curses.echo()
        prompt = f"Enter {self.name}:"
        screen.addstr(starting_line, 0, prompt)
        screen.refresh()
        user_input_bytes = screen.getstr(starting_line, len(prompt), MAX_INPUT_LENGTH)
        curses.noecho()

        return user_input_bytes.decode()

    def get_secret_prompt(self, screen: curses.window, starting_line=0) -> str:
        curses.noecho()
        prompt = f"Enter {self.name}:"
        screen.addstr(starting_line, 0, prompt, curses.A_STANDOUT)
        screen.refresh()
        return secret_typing(screen)
