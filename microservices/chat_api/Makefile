all: up

up:
	cd ../.. && docker compose up --no-deps chat_api

dev:
	cd ../.. && docker compose build --no-cache chat_api && docker compose up --no-deps chat_api

down:
	cd ../.. && docker compose down

clear:
	clear

remove:
	docker compose down --volumes
	docker system prune -a -f --volumes
	docker builder prune -a -f

super: remove clear dev

