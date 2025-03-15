all: up

up:
	cd yml && docker-compose build
	cd yml && docker-compose up

dev:
	cd yml && docker-compose build --no-cache
	cd yml && docker-compose up

down:
	cd yml && docker-compose down --volumes

clear:
	clear

remove:
	cd yml && docker-compose down --volumes
	cd yml && docker system prune -a -f --volumes
	cd yml && docker builder prune -a -f
	# sudo truncate -s 0 /var/lib/docker/containers/*/*-json.log

super: remove clear dev

