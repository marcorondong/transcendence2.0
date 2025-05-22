all: up

up:
	cd ../.. && docker compose up --no-deps tictactoe_db

dev:
	cd ../.. && docker compose build --no-cache tictactoe_db && docker compose up --no-deps tictactoe_db

down:
	make -C ../.. clean

clear:
	clear

remove:
	make -C ../.. remove

super: remove clear dev