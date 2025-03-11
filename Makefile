all: up

up:
	cd yml && docker-compose up --build

down:
	cd yml && docker-compose down --volumes

clear:
	clear

remove:
	cd yml && docker-compose down --volumes
	cd yml && docker system prune -a -f --volumes
	cd yml && docker builder prune -a -f

super: remove clear up

