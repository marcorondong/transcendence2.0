#!/bin/bash
PW_FILE="monitoring/secrets/grafana_admin_password.txt"
cat /dev/urandom | tr -dc 'A-Za-z0-9' | head -c 20 > "$PW_FILE"
chmod +r "$PW_FILE"