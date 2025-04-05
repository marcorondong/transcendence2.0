#!/bin/bash
SCRIPT_DIR="$(dirname "$(realpath "$0")")"
mkdir -p "/etc/nginx/"
openssl req -x509 -newkey rsa:4096 -keyout "/etc/nginx/key.pem" -out "/etc/nginx/cert.pem" -sha256 -days 3650 -nodes -subj "/C=AT/ST=Austria/L=Vienna/O=Transcedence2.0/OU=VoidCluster/CN=CommonNameOrHostname"
