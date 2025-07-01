# 🔐 AUTH Service

## Table Of Contents

- [🔐 AUTH Service](#-auth-service)
  - [Table Of Contents](#table-of-contents)
  - [🔀 API Endpoints](#-api-endpoints)
  - [Protected Routes](#protected-routes)
    - [Game Statistics](#game-statistics)
    - [Chat Management](#chat-management)
    - [User Management](#user-management)

## 🔀 API Endpoints

| #  | Method | Path                                                         | Description     | Microservice     |
| -- | ------ | ------------------------------------------------------------ | --------------- |----------------- |
| 1  | POST   | `https://localhost:443/auth-api/sign-in`                    | Login user      | Frontend         |
| 2  | POST   | `https://localhost:443/auth-api/sign-up`                    | Register user   | Frontend         |
| 3  | POST   | `https://localhost:443/auth-api/sign-out`                   | Logout user     | Frontend         |
| 4  | GET    | `https://localhost:443/auth-api/verify-jwt`                 | Verify JWT      | Frontend         |
| 5  | POST   | `https://localhost:443/auth-api/refresh-jwt`                | Refresh JWT     | Frontend         |
| 6  | GET    | `http://auth_api_container:2999/auth-api/bot-jwt`            | Token for Bot   | Ai-Bot, Frontend |
| 7  | POST   | `http://auth_api_container:2999/auth-api/verify-connection`  | Verify WS Conn. | Pong,Chat,Tic,Fr |
| 8  | GET    | `http://auth_api_container:2999/auth-api/health-check`       | Health check    | Monitoring       |
| 9  | GET    | `http://localhost:2999/auth-api/documentation`               | Swagger         | Everyone         |
| 10 | POST   | `https://localhost:443/auth-api/update-jwt`                 | Update JWT      | Frontend         |

1) Sign in a user. This will contact with users service and create the token for the user in browser in case of success.
2) Sign up a user. This will contact with users service and create the token for the user in browser in case of success.
3) Sign out a user. This will delete the token for the user.
4) Verify a user. This will check if the token is valid.
5) Refresh a user. This will refresh the token for the user.
6) Get the bot JWT. This will return the JWT for bot.
7) Verify Cookies and JWT. Returns Payload (id and nickname)
8) Check the health of the service
9) Swagger page for detailed information
10) Update JWT. This will extract id from JWT and make request to users/:id to get nickname and will update JWT accordingly

Detailed information about routes, shape of body, param, response is in swagger page.

## Protected Routes

The following endpoints are routed through nginx with authentication sub-request:

### Game Statistics

- `GET https://{frontend:port}/tictactoe-db/game-history`
- `GET https://{frontend:port}/tictactoe-db/total-stats`
- `GET https://{frontend:port}/tictactoe-db/head-to-head`
- `GET https://{frontend:port}/pong-db/game-history`
- `GET https://{frontend:port}/pong-db/total-stats`
- `GET https://{frontend:port}/pong-db/head-to-head`

### Chat Management

- `GET https://{frontend:port}/chat-db/block-status`
- `POST https://{frontend:port}/chat-db/block-user`
- `POST https://{frontend:port}/chat-db/unblock-user`

### User Management

- `GET/PUT/PATCH https://{frontend:port}/api/users/{uuid}`
