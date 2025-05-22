all: up

up:
	cd ../.. && docker compose up --no-deps auth_api

dev:
	cd ../.. && docker compose build --no-cache auth_api && docker compose up --no-deps auth_api

down:
	cd ../.. && docker compose down

clear:
	clear

remove:
	docker compose down --volumes
	docker system prune -a -f --volumes
	docker builder prune -a -f

super: remove clear dev