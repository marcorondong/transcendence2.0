GRAFANA_PW = monitoring/secrets/grafana_admin_password.txt
PROMETHEUS_PW = monitoring/secrets/prometheus_admin_password.txt
SECRET_DIRECTORIES = monitoring/secrets
SECRETS = $(SECRET_DIRECTORIES) $(GRAFANA_PW) $(PROMETHEUS_PW)

make: $(SECRETS)
	docker-compose up -d

$(SECRET_DIRECTORIES):
	mkdir -p monitoring/secrets

$(GRAFANA_PW):
	./monitoring/grafana/create_password.sh

$(PROMETHEUS_PW):
	./monitoring/prometheus/create_password.sh
	cat monitoring/secrets/prometheus_admin_password.txt | htpasswd -inB "" >> monitoring/prometheus/web.yml
