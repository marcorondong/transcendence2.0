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
| 1  | POST   | `https://localhost:8080/auth-api/sign-in`                    | Login user      | Frontend         |
| 2  | POST   | `https://localhost:8080/auth-api/sign-up`                    | Register user   | Frontend         |
| 3  | DELETE | `https://localhost:8080/auth-api/sign-out`                   | Logout user     | Frontend         |
| 4  | GET    | `https://localhost:8080/auth-api/verify-jwt`                 | Verify JWT      | Frontend         |
| 5  | GET    | `https://localhost:8080/auth-api/refresh-jwt`                | Refresh JWT     | Frontend         |
| 6  | PATCH  | `https://localhost:8080/auth-api/users/:id`                  | Edit Profile    | Frontend         |
| 7  | PUT    | `https://localhost:8080/auth-api/users/:id`                  | Update Profile  | Frontend         |
| 8  | DELETE | `https://localhost:8080/auth-api/users/:id`                  | Delete User     | Frontend         |
| 9  | GET    | `http://auth_api_container:2999/auth-api/bot-jwt`            | Token for Bot   | Ai-Bot           |
| 10 | GET    | `http://auth_api_container:2999/auth-api/verify-connection`  | Verify WS Conn. | Pong, Chat, Tic  |
| 11 | GET    | `http://auth_api_container:2999/auth-api/health-check`       | Health check    | Monitoring       |
| 12 | GET    | `http://localhost:2999/auth-api/documentation`               | Swagger         | Everyone         |

1) Sign in a user. This will create the token for the user.
2) Sign up a user. This will create the user and the token.
3) Sign out a user. This will delete the token for the user.
4) Verify a user. This will check if the token is valid.
5) Refresh a user. This will refresh the token for the user.
6) Edit the profile of the user and update token.
7) Update the whole profile of the user and update token.
8) Delete a user. This will delete the user and the token.
9) Get the bot JWT. This will return the JWT for bot.
10) Verify Cookies and JWT for internal services. Returns id and nickname
11) Check the health of the service
12) Swagger page for detailed information

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
