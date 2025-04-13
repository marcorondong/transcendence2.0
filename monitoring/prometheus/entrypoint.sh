#!/bin/bash

cat "/run/secrets/prometheus_admin_password" | htpasswd -inB "" >> /etc/prometheus/web.yml

"$@"