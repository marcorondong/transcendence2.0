all: up

up:
	cd ../.. && docker compose up --no-deps tictactoe_api

dev:
	cd ../.. && docker compose build --no-cache tictactoe_api && docker compose up --no-deps tictactoe_api

down:
	make -C ../.. clean

clear:
	clear

remove:
	make -C ../.. remove

super: remove clear dev