GRAFANA_PW = monitoring/secrets/grafana_admin_password.txt
SLACK_WEBHOOK = monitoring/secrets/slack_webhook.txt
SECRET_DIRECTORIES = monitoring/secrets

SECRETS = $(SECRET_DIRECTORIES) $(GRAFANA_PW) $(SLACK_WEBHOOK)

all: $(SECRETS)
	docker-compose up -d

re:
	docker-compose down
	make

clean:
	docker-compose down

$(SECRET_DIRECTORIES):
	mkdir -p monitoring/secrets

$(GRAFANA_PW):
	./monitoring/grafana/create_password.sh

.PHONY: all re clean