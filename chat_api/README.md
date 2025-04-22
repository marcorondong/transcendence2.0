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
  "type": "message",
  "message": "any message",
  "relatedId": "UUID of user2"
} 
```

### Reply (to User1)
```json
{
  "type": "messageResponse",
  "message": "any message",
  "relatedId": "UUID of user1"
}
```
### Reply (to User2)
```json
{
  "type": "messageResponse",
  "message": "any message",
  "relatedId": "UUID of user1"
}
```

## 🚫 2. Block / Unblock a User

** User1 blocks or unblocks User2 **

### Request (from User1)
```json
{
  "type": "block",
  "relatedId": "UUID of user2"
}
```

### Reply (to User1)
```json
{
  "type": "blockResponse",
  "relatedId": "UUID of user2",
  "notification": "optional for debugging",
}
```
Note: No reply is sent to User2 by default. Can be add upon request.


## 🚫 3. Block Status Check

** User1 checks User2 block status **

### Request (from User1)
```json
{
  "type": "blockStatus",
  "relatedId": "UUID of user2"
}
```

### Reply (to User1)
```json
{
  "type": "blockStatusResponse",
  "blockStatus": true or false,
  "relatedId": "UUID of user2",
  "notification": "optional for debugging",
}
```
Note: No reply is sent to User2 by default. Can be add upon request.

## 📨 4. Invite Someone

**User1 sends an invitation to User2**

### Request (from User1)
```json
{
  "type": "invite",
  "relatedId": "UUID of user2"
}
```

### Reply (to User2)
``` json
{
  "type": "inviteResponse",
  "relatedId": "UUID of user1",
  "roomId": "Room id to open socket",
  "notification": "optional for debugging",
}
```
Note: No reply is sent to User1. Can be add upon request.

## ❌ 5. Terminate user

**If you want to close websocket connection of client**

### Request (from User)
```json
{
  "type": "terminate",
}
``` 

<!-- No need this step as process is simpler now -->
<!-- ## ✅ Accept Invitation

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
``` -->

<!-- No need this step as process is simpler now -->
<!-- ### 🔌 Socket Initialization

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
``` -->

## 👤 New Client Joined

**A new client (e.g., user101) joins the app**

### Reply (to user101)
```json
{
  "type": "peopleOnline",
  "peopleOnline": ["array", "of", "all", "online", "people"],
  "notification": "optional for debugging",
} 
```
### Reply (to all other users)
``` json
{
  "type": "newClient",
  "relatedId": "UUID of user101",
  "notification": "optional for debugging",
}
```

## 🔌 Disconnection Event

**When a client disconnects, the backend sends a disconnection event.**

### Reply (to other clients)
```json
{
  "type": "disconnected",
  "relatedId": "UUID of the disconnected client",
  "notification": "optional for debugging",
}
```
Note: This event informs all other clients about the disconnection, and they can update their UI accordingly (e.g., removing the user from the online list).


## ❌ Error Handling

**In case of an error, the backend replies with an error message**

### Reply (to client)
```json
{
  "type": "error",
  "relatedId": "UUID of the client",
  "error": "Description of the error"
}
``` 

