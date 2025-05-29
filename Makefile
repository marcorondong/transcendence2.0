#docker compose needs this dir to mount secrets for monitoring
MONITORING_SECRETS = ./monitoring/secrets
GRAFANA_PW = $(MONITORING_SECRETS)/grafana_admin_password.txt
SLACK_WEBHOOK = $(MONITORING_SECRETS)/slack_webhook.txt
PONG_ENV = ./microservices/ssg/pong-api/.env
AUTH_API_COOKIE_SECRET = ./microservices/auth_api/secret_keys/cookieSecret.key
AUTH_API_JWT_SECRET = ./microservices/auth_api/secret_keys/jwtSecret.key
GLOBAL_ENV = .env

#we can add more to this list if needed
SECRET_DIRECTORIES = $(MONITORING_SECRETS)

SECRET_FILES = $(GRAFANA_PW) $(SLACK_WEBHOOK) $(PONG_ENV) $(GLOBAL_ENV) $(AUTH_API_COOKIE_SECRET) $(AUTH_API_JWT_SECRET)

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

delete-secrets:
	echo "Deleting secrets"
	rm -f $(SECRET_FILES)
	rm -rf $(SECRET_DIRECTORIES)

dev:
	docker compose build --no-cache
	docker compose up

nuke: clean
	docker system prune -a -f --volumes
	docker builder prune -a -f
	$(MAKE) delete-secrets

cli: all
	make -C cli-client

$(SECRET_DIRECTORIES):
	mkdir -p $(SECRET_DIRECTORIES)

#simple script since i can automate password protection in entrypoint of grafana
$(GRAFANA_PW): $(SECRET_DIRECTORIES)
	./monitoring/grafana/create_password.sh

$(PONG_ENV):
	ft_crypt.sh --decrypt="$(PONG_ENV).enc" --force

$(AUTH_API_COOKIE_SECRET):
	ft_crypt.sh --decrypt="$(AUTH_API_COOKIE_SECRET).enc" --force

$(AUTH_API_JWT_SECRET):
	ft_crypt.sh --decrypt="$(AUTH_API_JWT_SECRET).enc" --force

$(GLOBAL_ENV):
	ft_crypt.sh --decrypt="$(GLOBAL_ENV).enc" --force

$(SLACK_WEBHOOK): $(SECRET_DIRECTORIES)
	ft_crypt.sh --decrypt="./monitoring/alertmanager/slack_webhook.txt.enc" --force
	mv ./monitoring/alertmanager/slack_webhook.txt $(SLACK_WEBHOOK)


.PHONY: all re clean remove delete-secrets dev nuke cli
