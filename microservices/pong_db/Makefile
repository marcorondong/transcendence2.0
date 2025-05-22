all: up

up:
	cd ../.. && docker compose up --no-deps pong_db

dev:
	cd ../.. && docker compose build --no-cache pong_db && docker compose up --no-deps pong_db

down:
	make -C ../.. clean

clear:
	clear

remove:
	make -C ../.. remove

super: remove clear dev