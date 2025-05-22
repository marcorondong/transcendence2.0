all: up

up:
	cd ../.. && docker compose up --no-deps pong_db

dev:
	cd ../.. && docker compose build --no-cache pong_db && docker compose up --no-deps pong_db

down:
	cd ../.. && docker compose down

clear:
	clear

remove:
	docker compose down --volumes
	docker system prune -a -f --volumes
	docker builder prune -a -f

super: remove clear dev