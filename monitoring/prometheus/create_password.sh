#!/bin/bash
cat /dev/urandom | tr -dc 'A-Za-z0-9' | head -c 20 > monitoring/secrets/prometheus_admin_password.txt