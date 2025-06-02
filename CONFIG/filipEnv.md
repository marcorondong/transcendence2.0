## IDEA

### ENV
We have env file which have no sensitive data (we can talk about it; it is possible to also have sensitive but we will see). **We are not pushing it**, aka if we do it stays encrypted. But contains stuff that are needed for docker compose
Example of .env file
```env
PONG_API_PORT=3010
PONG_API_CONTAINER_NAME=pong_api_container

AUTH_API_PORT=2999
```
### DOCKER COMPOSE 
Docker COMPOSE file read from ENV FILE to create container like 
```yml
services:
  auth_api:
    image: ${AUTH_API_IMAGE_NAME}
    container_name: ${AUTH_API_CONTAINER_NAME}

```

### SCRIPT to create baseJson from env (SCRIPT_JSON)
json is static it cannot read from env. So idea is that i will write script (bash most likely) that will 
turn this template (we can push template) 
```json 
{
  "docker": {
      "network": ENV_NAME,
      "pongApi": {
        "port": ENV_PORT,
        "imageName": ENV_IMG,
        "containerName": ENV_CONTAINER
      },
      "aiBot": {
        "port": ENV_PORT,
        "imageName": ENV_IMG,
        "containerName": ENV_CONTAINER
      },
      "frontend": {
        "port": ENV_PORT,
        "imageName": ENV_IMG,
        "containerName": ENV_CONTAINER
      },
      "authApi": {
        "port": ENV_PORT,
        "imageName": ENV_IMG,
        "containerName": ENV_CONTAINER
      }
  }
}
```

to this (final version can be pushed if you want, it is also fine if we ignore it)
```json
{
  "docker": {
    "network": "Transcendence2.0",
    "pongApi": {
      "port": 3010,
      "imageName": "pong-api-img",
      "containerName": "pong-api"
    },
    "aiBot": {
      "port": 6969,
      "imageName": "ai-bot",
      "containerName": "ai-bot"
    },
    "frontend": {
      "port": 8080,
      "imageName": "frontend",
      "containerName": "frontend"
    },
    "authApi": {
      "port": 2999,
      "imageName": "auth_api_image",
      "containerName": "auth_api_container"
    }
  },
}
```

### EXTEND JSON (HAND_WRITTEN_JSON)
now we will need another json. in this we/you define stuff that other microservices will need from our/your microservices like bot nickname routes etc. **WE ARE PUSHING THIS** 
example 
```json
{
  "pongApi": {
    "routes": {
      "singles": "pong-api/pong/singles",
      "doubles": "pong-api/pong/doubles"
    }
  },

  "authApi": {
    "routes": {
      "login": "auth-api/login",
      "register": "auth-api/register"
    }
  },
  "ai-bot":{
    "nickname":"NovakBotkovic"
  }
}
```

### SCRIPT THAT CREATES transcendence-config.json
again script that will also probably be bash that will take [SCRIPT_JSON](#script-that-creates-transcendence-configjson) and [HAND_WRITTEN_JSON](#extend-json-hand_written_json), and create file  transcendence-config.json that combine both like this. We are pushing script, your call if you want to push this final file to git
```json
{
  "docker": {
    "network": "Transcendence2.0",
    "pongApi": {
      "port": 3010,
      "imageName": "pong-api-img",
      "containerName": "pong-api"
    },
    "aiBot": {
      "port": 6969,
      "imageName": "ai-bot",
      "containerName": "ai-bot"
    },
    "frontend": {
      "port": 8080,
      "imageName": "frontend",
      "containerName": "frontend"
    },
    "authApi": {
      "port": 2999,
      "imageName": "auth_api_image",
      "containerName": "auth_api_container"
    }
  },

  "pongApi": {
    "routes": {
      "singles": "pong-api/pong/singles",
      "doubles": "pong-api/pong/doubles"
    }
  },

  "authApi": {
    "routes": {
      "singles": "pong-api/pong/singles",
      "doubles": "pong-api/pong/doubles"
    }
  },
  "ai-bot":{
    "nickname":"NovakBotkovic"
  }
}
```

### LINK_SCRIPT
`transcendence-config.json` will be in root level. This is problematic for build context that is deeper in project.
Idea is that i will write script that will create symbolic or hard link(so it is still one source of truth) to the root of each microservices so you can COPY it it with dockerfile without fucking up with build context. Link script will be in tools.


### USING
1. Makefile will check if ENV exist
2. Makefile calls script to create JSON from env
3. Makefile calls script to combine JSON from env and handwritten to create `transcendence-config.json`.
4. Makefile calls script to give each microservice root folder symbolic link to `transcendence-config.json`
5. once transcendence-config.json is available you can use it to read stuff from other and save what you need 
like in config.ts of your service 
```typescript
import config from './transcendence-config.json';

export const BOT_NICKNAME = config.aiBot.nickname;

```
