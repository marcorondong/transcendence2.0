all: up

up:
	cd ../.. && docker compose up --no-deps tictactoe_api

dev:
	cd ../.. && docker compose build --no-cache tictactoe_api && docker compose up --no-deps tictactoe_api

down:
	cd ../.. && docker compose down

clear:
	clear

remove:
	docker compose down --volumes
	docker system prune -a -f --volumes
	docker builder prune -a -f

super: remove clear dev