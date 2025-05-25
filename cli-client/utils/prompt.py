import curses

MAX_INPUT_LENGTH = 128


class Prompt:
    name: str

    def __init__(self, prompt_name: str):
        self.name = prompt_name

    def get_prompt(self, screen: curses.window, starting_line=0) -> str:
        curses.echo()
        prompt = f"Enter {self.name}: "
        screen.addstr(starting_line, 0, prompt)
        screen.refresh()
        user_input_bytes = screen.getstr(starting_line, len(prompt), MAX_INPUT_LENGTH)
       # screen.getch()
        curses.noecho()

        return user_input_bytes.decode()
