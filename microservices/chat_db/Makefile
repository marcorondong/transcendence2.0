all: up

up:
	cd ../.. && docker compose up --no-deps chat_db

dev:
	cd ../.. && docker compose build --no-cache chat_db && docker compose up --no-deps chat_db

down:
	make -C ../.. clean

clear:
	clear

remove:
	make -C ../.. remove

super: remove clear dev