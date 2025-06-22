#docker compose needs this dir to mount secrets for monitoring
MONITORING_SECRETS = ./monitoring/secrets
GRAFANA_PW = $(MONITORING_SECRETS)/grafana_admin_password.txt
SLACK_WEBHOOK = $(MONITORING_SECRETS)/slack_webhook.txt
PONG_ENV = ./microservices/ssg/pong-api/.env
BOT_ENV = ./microservices/ssg/ai-bot/docker/.env
AUTH_API_COOKIE_SECRET = ./microservices/auth_api/secret_keys/cookieSecret.key
AUTH_API_JWT_SECRET = ./microservices/auth_api/secret_keys/jwtSecret.key
GLOBAL_ENV = .env
REBUILD_SERVICE = -re

SECRET_DIRECTORIES = $(MONITORING_SECRETS)

SECRET_FILES = $(GRAFANA_PW) $(SLACK_WEBHOOK) $(PONG_ENV) \
	$(GLOBAL_ENV) $(AUTH_API_COOKIE_SECRET) $(AUTH_API_JWT_SECRET) \
	$(BOT_ENV)

all: $(SECRET_FILES)
	docker compose up -d

re: clean
	make

clean:
	docker compose down

remove:
	docker compose down --volumes
	docker system prune -a -f --volumes
	$(MAKE) delete-secrets
	$(MAKE) -C cli-client clean

reset:
	docker-compose down --volumes
	docker system prune -a -f --volumes
	docker builder prune -a -f

dev:
	docker compose build --no-cache
	docker compose up

cli: all
	make -C cli-client

nuke:
	docker ps -aq | xargs -r docker rm -f
	-docker images -q | xargs -r docker rmi -f
	-docker volume ls -q | xargs -r docker volume rm
	-docker network ls -q | xargs -r docker network inspect --format '{{.Name}} {{.Id}}' | grep -vE '^(bridge|host|none)' | awk '{print $2}' | xargs -r docker network rm
	docker system prune -a -f --volumes
	docker builder prune -a -f
	$(MAKE) delete-secrets

delete-secrets:
	echo "Deleting secrets"
	rm -f $(SECRET_FILES)
	rm -rf $(SECRET_DIRECTORIES)

# e.g. "make users-re" to rebuild users image and container
%$(REBUILD_SERVICE):
	@echo "rebuilding $(@:$(REBUILD_SERVICE)=)"
	-docker container rm -f $(shell docker ps | awk '{print $$NF}' | grep $(@:$(REBUILD_SERVICE)=))
	docker image rm -f $(shell docker images | awk '{print $$1,$$2}' | grep $(@:$(REBUILD_SERVICE)=) | tr ' ' ':')
	make

$(SECRET_DIRECTORIES):
	mkdir -p $(SECRET_DIRECTORIES)

$(GRAFANA_PW): $(SECRET_DIRECTORIES)
	./monitoring/grafana/create_password.sh

$(PONG_ENV):
	ft_crypt.sh --decrypt="$(PONG_ENV).enc" --force

$(BOT_ENV):
	ft_crypt.sh --decrypt="$(BOT_ENV).enc" --force

$(AUTH_API_COOKIE_SECRET):
	ft_crypt.sh --decrypt="$(AUTH_API_COOKIE_SECRET).enc" --force

$(AUTH_API_JWT_SECRET):
	ft_crypt.sh --decrypt="$(AUTH_API_JWT_SECRET).enc" --force

$(GLOBAL_ENV):
	ft_crypt.sh --decrypt="$(GLOBAL_ENV).enc" --force

$(SLACK_WEBHOOK): $(SECRET_DIRECTORIES)
	ft_crypt.sh --decrypt="./monitoring/alertmanager/slack_webhook.txt.enc" --force
	mv ./monitoring/alertmanager/slack_webhook.txt $(SLACK_WEBHOOK)


.PHONY: all re clean remove dev cli nuke delete-secrets reset %$(REBUILD_SERVICE) 
