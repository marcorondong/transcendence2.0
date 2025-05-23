all: up

up:
	cd ../.. && docker compose up --no-deps chat_api

dev:
	cd ../.. && docker compose build --no-cache chat_api && docker compose up --no-deps chat_api

down:
	make -C ../.. clean

clear:
	clear

remove:
	make -C ../.. remove

super: remove clear dev