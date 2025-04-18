#!/bin/bash

set -e

PW="$(cat /run/secrets/grafana_admin_password)"

(sleep 10

grafana cli --homepath "/usr/share/grafana" admin reset-admin-password "$PW"

curl -X 'POST' \
	'http://localhost:3000/api/datasources' \
	-H 'accept: application/json' \
	-H 'Content-Type: application/json' \
	-u admin:"$PW" \
	-d '{
	"access": "proxy",
	"basicAuth": false,
	"database": "",
	"isDefault": true,
	"jsonData": {
		"httpMethod": "POST",
		"oauthPassThru": false,
		"sigV4Auth": false
	},
	"name": "prometheus",
	"type": "prometheus",
	"typeLogoUrl": "public/app/plugins/datasource/prometheus/img/prometheus_logo.svg",
	"url": "http://prometheus:9090",
	"withCredentials": false
	}'

TAGS=$(curl -X 'GET' \
	'http://localhost:3000/api/dashboards/tags' \
	-u "admin:$PW" \
	-H 'accept: application/json')

for FILE in /etc/grafana/custom-dashboards/*.json; do
    FILENAME=$(basename "$FILE" .json)

	if ! echo "$TAGS" | grep -q "$FILENAME" ; then
		echo "Uploading: $FILENAME"
  		curl -X 'POST' \
			'http://localhost:3000/api/dashboards/db' \
			-H 'accept: application/json' \
			-H 'Content-Type: application/json' \
			-u admin:"$(cat /run/secrets/grafana_admin_password)" \
			-d "@$FILE"
	else
		echo "Skipping: $FILENAME (already tagged)"
	fi
done

exit) &

exec /run.sh