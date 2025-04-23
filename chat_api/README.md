# 🛰️ Frontend Communication Protocol

This document defines the request and reply structures for communication between the **frontend** and **backend**.

Each interaction follows this pattern:

- **Request** → Sent from frontend
- **Reply** → Sent from backend

---

## 📩 1. Message Someone

**User1 sends a message to User2**

### Request (from User1)
```json
{
  "message": "any message",
  "relatedId": "UUID of user2"
} 
```

### Reply (to User1)
```json
{
  "message": "any message",
  "relatedId": "UUID of user1"
}
```
### Reply (to User2)
```json
{
  "message": "any message",
  "relatedId": "UUID of user1"
}
```

## 🚫 2. Block / Unblock a User

** User1 blocks or unblocks User2 **

### Request (from User1)
```json
{
  "block": true,
  "relatedId": "UUID of user2"
}
```

### Reply (to User1)
```json
{
  "block": true,
  "relatedId": "UUID of user2"
}
```
Note: No reply is sent to User2 by default. Can be add upon request.

## 📨 3. Invite Someone

**User1 sends an invitation to User2**

### Request (from User1)
```json
{
  "invite": true,
  "relatedId": "UUID of user2"
}
```

### Reply (to User2)
``` json
{
  "invite": true,
  "relatedId": "UUID of user1"
}
```
Note: No reply is sent to User1. Can be add upon request.

## ✅ 4. Accept Invitation

**User2 accepts User1's invitation**

### Request (from User2)
```json
{
  "inviteAccepted": true,
  "relatedId": "UUID of user1"
}
```

### Reply (to User1)
``` json
{
  "openSocket": true,
  "relatedId": "UUID of user2"
}
```

### 🔌 Socket Initialization

**Once the socket is established, User1 must notify the backend**

### Request (from User1)
```json
{
  "socketOpened": true,
  "relatedId": "UUID of user2"
}
```

### Reply (to User2)
``` json
{
  "joinRoom": true,
  "roomId": "room id to build connection with"
}
```

## 👤 5. New Client Joined

**A new client (e.g., user101) joins the app**

### Reply (to user101)
```json
{
  "peopleOnline": ["array", "of", "all", "online", "people"]
} 
```
### Reply (to all other users)
``` json
{
  "newClient": "UUID of user101"
}
```

## 🔌 Disconnection Event

**When a client disconnects, the backend sends a disconnection event.**

### Reply (to other clients)
```json
{
  "clientDisconnected": true,
  "relatedId": "UUID of the disconnected client"
}
```
Note: This event informs all other clients about the disconnection, and they can update their UI accordingly (e.g., removing the user from the online list).


## ❌ Error Handling

**In case of an error, the backend replies with an error message**

### Reply (to client)
```json
{
  "error": true,
  "relatedId": "UUID of the client",
  "errorMessage": "Description of the error"
}
``` 

