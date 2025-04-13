#!/bin/bash

(sleep 10

grafana cli --homepath "/usr/share/grafana" admin reset-admin-password $(cat /run/secrets/grafana_admin_password)

curl -X 'POST' \
'http://localhost:3000/api/datasources' \
-H 'accept: application/json' \
-H 'Content-Type: application/json' \
-u admin:"$(cat /run/secrets/grafana_admin_password)" \
-d '{
"access": "proxy",
"basicAuth": true,
"basicAuthUser": "transcended_user",
"database": "",
"isDefault": true,
"jsonData": {
	"httpMethod": "POST",
	"oauthPassThru": false,
	"sigV4Auth": false
},
"name": "prometheus",
"secureJsonData": {
	"basicAuthPassword": "'"$(cat /run/secrets/prometheus_admin_password)"'",
	"password": "'"$(cat /run/secrets/prometheus_admin_password)"'"
},
"type": "prometheus",
"typeLogoUrl": "public/app/plugins/datasource/prometheus/img/prometheus_logo.svg",
"url": "http://prometheus:9090",
"user": "transcended_user",
"withCredentials": false
}'

curl -X 'POST' \
	'http://localhost:3000/api/dashboards/db' \
	-H 'accept: application/json' \
	-H 'Content-Type: application/json' \
	-u admin:"$(cat /run/secrets/grafana_admin_password)" \
	-d "@/etc/grafana/custom-dashboards/host_sys_monitor.json"

for file in /etc/grafana/custom-dashboards/*.json; do
  echo "Importing dashboard from $file"
  curl -X 'POST' \
	'http://localhost:3000/api/dashboards/db' \
	-H 'accept: application/json' \
	-H 'Content-Type: application/json' \
	-u admin:"$(cat /run/secrets/grafana_admin_password)" \
	-d "@$file"
done

exit) &

exec /run.sh