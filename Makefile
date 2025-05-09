#docker compose needs this dir to mount secrets for monitoring
MONITORING_SECRETS = ./monitoring/secrets
GRAFANA_PW = $(MONITORING_SECRETS)/grafana_admin_password.txt
SLACK_WEBHOOK = $(MONITORING_SECRETS)/slack_webhook.txt
PONG_ENV = ssg/pong-api/.env

#we can add more to this list if needed
SECRET_DIRECTORIES = $(MONITORING_SECRETS)

SECRETS = $(SECRET_DIRECTORIES) $(GRAFANA_PW) $(SLACK_WEBHOOK) $(PONG_ENV)

all: $(SECRETS)
	docker compose up -d

re: clean
	make

clean:
	docker compose down

remove:
	docker compose down --volumes
	docker system prune -a -f --volumes
	docker builder prune -a -f

dev:
	docker compose build --no-cache
	docker compose up

nuke: clean
	docker system prune -a --volumes

cli: all
	make -C cli-client

$(SECRET_DIRECTORIES):
	mkdir -p $(SECRET_DIRECTORIES)

#simple script since i can automate password protection in entrypoint of grafana
$(GRAFANA_PW):
	./monitoring/grafana/create_password.sh

$(PONG_ENV):
	ft_crypt.sh --decrypt="$(PONG_ENV).enc" --force

.PHONY: all re clean
