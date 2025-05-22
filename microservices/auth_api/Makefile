all: up

up:
	cd ../.. && docker compose up --no-deps auth_api

dev:
	cd ../.. && docker compose build --no-cache auth_api && docker compose up --no-deps auth_api

down:
	make -C ../.. clean

clear:
	clear

remove:
	make -C ../.. remove

super: remove clear dev