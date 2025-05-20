#!/bin/bash
SCRIPT_DIR="$(dirname "$(realpath "$0")")"
mkdir -p "$SCRIPT_DIR/../server-keys/"
openssl req -x509 -newkey rsa:4096 -keyout "$SCRIPT_DIR/../server-keys/key.pem" -out "$SCRIPT_DIR/../server-keys/cert.pem" -sha256 -days 3650 -nodes -subj "/C=AT/ST=Austria/L=Vienna/O=Transcedence2.0/OU=VoidCluster/CN=CommonNameOrHostname"
