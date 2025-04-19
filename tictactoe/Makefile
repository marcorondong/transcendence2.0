all: up

up:
	docker-compose up --build

dev:
	docker-compose build --no-cache
	docker-compose up

down:
	docker-compose down --volumes

clear:
	clear

remove:
	docker-compose down --volumes
	docker system prune -a -f --volumes
	docker builder prune -a -f

super: remove clear up

