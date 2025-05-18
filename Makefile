#docker compose needs this dir to mount secrets for monitoring
MONITORING_SECRETS = ./monitoring/secrets
GRAFANA_PW = $(MONITORING_SECRETS)/grafana_admin_password.txt
SLACK_WEBHOOK = $(MONITORING_SECRETS)/slack_webhook.txt
PONG_ENV = ssg/pong-api/.env
GLOBAL_ENV = .env

#we can add more to this list if needed
SECRET_DIRECTORIES = $(MONITORING_SECRETS)

SECRETS = $(SECRET_DIRECTORIES) $(GRAFANA_PW) $(SLACK_WEBHOOK) $(PONG_ENV) $(GLOBAL_ENV)

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

$(GLOBAL_ENV):
	ft_crypt.sh --decrypt="$(GLOBAL_ENV).enc" --force

$(SLACK_WEBHOOK):
	ft_crypt.sh --decrypt="./monitoring/alertmanager/slack_webhook.txt.enc" --force
	mv ./monitoring/alertmanager/slack_webhook.txt $(SLACK_WEBHOOK)

.PHONY: all re clean
