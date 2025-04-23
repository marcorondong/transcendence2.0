#docker compose needs this dir to mount secrets for monitoring
MONITORING_SECRETS = ./monitoring/secrets
GRAFANA_PW = $(MONITORING_SECRETS)/grafana_admin_password.txt
SLACK_WEBHOOK = $(MONITORING_SECRETS)/slack_webhook.txt

#we can add more to this list if needed
SECRET_DIRECTORIES = $(MONITORING_SECRETS)

SECRETS = $(SECRET_DIRECTORIES) $(GRAFANA_PW) $(SLACK_WEBHOOK)

all: $(SECRETS)
	docker-compose up -d

re:
	docker-compose down
	make

clean:
	docker-compose down

cli: all
	python3 cli-client/mainMenu.py

$(SECRET_DIRECTORIES):
	mkdir -p $(SECRET_DIRECTORIES)

#simple script since i can automate password protection in entrypoint of grafana
$(GRAFANA_PW):
	./monitoring/grafana/create_password.sh

# more complicated decrypt with ansible-vault
# package installation required
# it will prompt for the encryption password
# $(SLACK_WEBHOOK):
# 	cp ./monitoring/alertmanager/slack_webhook.txt.encrypted $(SLACK_WEBHOOK)
# 	ansible-vault decrypt $(SLACK_WEBHOOK) || (rm $(SLACK_WEBHOOK) && exit 1)

.PHONY: all re clean
