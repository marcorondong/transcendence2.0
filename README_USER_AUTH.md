# User Authentication Endpoints

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

## Protected Routes
The following endpoints are routed through nginx with authentication subrequest:

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

# Problem
- `GET https://{frontend:port}/api/users/`
is not protected by auth subrequest because its the same URI as user registration. 
and if conditions in nginx locations dont work well with auth.
maybe there is a way but i didnt find it yet