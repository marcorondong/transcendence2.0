#!/bin/bash

ENV_FILE_NAME="new.env"
BASE_JSON_FILE_NAME="base.json"
EXTEND_JSON_FILE_NAME="extend.json"
TRANSCENDENCE_CONFIG_JSON_NAME="trans-conf.json"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

load_env() {
	#From now on you can read ENV FILE
	source "$ENV_FILE_NAME"
}

create_base_json()
{
  #Clear or create file
  > "$BASE_JSON_FILE_NAME"

  cat > "$BASE_JSON_FILE_NAME"<< EOF
{
  "docker": {
    "pongApi": {
      "port": $PONG_API_PORT,
      "containerName": "$PONG_API_CONTAINER_NAME"
    }
  }
}
EOF
}

create_global_conf()
{
	tac "$BASE_JSON_FILE_NAME" | sed '0,/}/s/}/,/' | tac > part1
	sed '0,/{/s/{//' "$EXTEND_JSON_FILE_NAME" > part2
	cat "part1" "part2" > "$TRANSCENDENCE_CONFIG_JSON_NAME"
	#TODO acitvate this rm part1 part2, try to make it more fancy with ,
}

create_copies_for_microservice()
{
  MICROSERVICES_FOLDER="$SCRIPT_DIR/../microservices"
	OG_FILE="$SCRIPT_DIR/$TRANSCENDENCE_CONFIG_JSON_NAME"
	PONG_API_LINK="$MICROSERVICES_FOLDER/ssg/pong-api/$TRANSCENDENCE_CONFIG_JSON_NAME"
	cp $OG_FILE $PONG_API_LINK
	#TODO remove write permission once final json will look nice
	#chmod -w $PONG_API_LINK
}

main(){
  load_env
  echo "$TEST"
  create_base_json
  create_global_conf
  create_copies_for_microservices
}


#Call the main function
main
