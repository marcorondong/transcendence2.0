# 🔐 AUTH Service

## Table Of Contents

- [🔐 AUTH Service](#-auth-service)
  - [Table Of Contents](#table-of-contents)
  - [🔀 API Endpoints](#-api-endpoints)
  - [User Authentication Endpoints](#user-authentication-endpoints)
    - [1. Register User](#1-register-user)
    - [2. Login User](#2-login-user)
    - [3. Logout](#3-logout)
  - [Protected Routes](#protected-routes)
    - [Game Statistics](#game-statistics)
    - [Chat Management](#chat-management)
    - [User Management](#user-management)
    - [Further Token Management](#further-token-management)
  - [Problem](#problem)

## 🔀 API Endpoints

| Method | Path                                           | Description                            |
| ------ | ---------------------------------------------- | -------------------------------------- |
| POST   | `https://{frontend:port}/auth-api/sign-in`     | Login user                             |
| DELETE | `https://{frontend:port}/auth-api/sign-out`    | Logout user                            |
| GET    | `https://{frontend:port}/auth-api/verify-jwt`   | Verify JWT Token                       |
| GET    | `https://{frontend:port}/auth-api/refresh-jwt` | Refresh JWT Token                      |
| GET    | `http://localhost:2999/auth-api/documentation` | Swagger (Good for testing all options) |

## User Authentication Endpoints

### 1. Register User

**Endpoint:** `POST https://{frontend:port}/api/users/`  
*Note: Keep the trailing "/"*

**Request Body:**

```json
{
    "email": "valid email format",
    "username": "min. 3 chars, including 1 letter",
    "nickname": "min. 3 chars, including 1 letter",
    "password": "min. 6 chars, including 1 lower, 1 upper, 1 digit, 1 symbol"
}
```

**Response Codes:**

- `400 Bad Request` - Invalid input
- `409 Conflict` - Username/email already exists
- `201 Created` - Registration successful

### 2. Login User

**Endpoint:** `POST https://{frontend:port}/auth-api/sign-in`

**Request Body:**

```json
{
    "identifier": "email or username",
    "password": "user password"
}
```

**Response Codes:**

- `400 Bad Request` - Empty credentials
- `401 Unauthorized` - Invalid credentials
- `201 Created` - Login successful (access token saved in client cookies)

### 3. Logout

**Endpoint** `DELETE https://{frontend:port}/auth-api/sign-out`

**Request Body:**

None

**Response Codes:**

- `200 OK` - cookie deleted from client

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

### Further Token Management

- `GET https://{frontend:port}/auth-api/verify-jwt`
- `GET https://{frontend:port}/auth-api/refresh-jwt`

## Problem

- `GET https://{frontend:port}/api/users/`
- `POST https://{frontend:port}/api/users/`

You can make two different request to the root of our user service.

GET should be protected by an auth sub-request.

POST should not be protected.

I tried if conditions and limit_except rule in nginx config, but could not get it working.

best case we can make a conditional auth sub-request on this route

worst case we have to redefine the route
