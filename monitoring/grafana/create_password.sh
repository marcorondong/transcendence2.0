#!/bin/bash
cat /dev/urandom | tr -dc 'A-Za-z0-9' | head -c 20 > monitoring/secrets/grafana_admin_password.txt