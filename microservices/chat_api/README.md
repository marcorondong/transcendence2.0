# 🛰️ Frontend Communication Protocol

This document defines the request and reply structures for communication between the **frontend** and **backend**.

Each interaction follows this pattern:

- **Request** → Sent from frontend
- **Reply** → Sent from backend

---

## 📩 Message Someone

User1 sends a message to User2

Request sent by User1

```json
{
    "type": "message",
    "id": "id of User2",
    "message": "any message"
}
```

Reply sent to User1

```json
{
    "type": "message",
    "sender": {
        "id": "id of User1",
        "nickname": "nickname of User1"
    },
    "receiver": {
        "id": "id of User2",
        "nickname": "nickname of User2"
    },
    "message": "new message"
}
```

### Reply (to User2)

```json
{
    "type": "message",
    "sender": {
        "id": "id of User1",
        "nickname": "nickname of User1"
    },
    "receiver": {
        "id": "id of User2",
        "nickname": "nickname of User2"
    },
    "message": "new message"
}
```

## 📨 Invite Someone

User1 sends an invitation to User2

Request sent by User1

```json
{
  "type": "invite",
  "id": "id of user2"
}
```

Reply sent to User1

``` json
{
    "type": "invite",
    "user": {
        "id": "id of User1",
        "nickname": "nickname of User1"
    },
    "roomId": "Room id to open socket",
}
```

Note: No reply is sent to User1. Can be add upon request.

## 👤 New User Joined

A new User (e.g., User101) joins the server

Reply sent to User1

```json
{
    "type": "onlineUsers",
    "users": 
      [
        {
            "id": "id of User1",
            "nickname": "nickname of User1"
        },
        {
            "id": "id of other Users",
            "nickname": "nickname of other Users"
        },
        {
            "id": "id of User100",
            "nickname": "nickname of User100"
        }
      ],
    "me": {
        "id": "id of current user",
        "nickname": "nickname of current user"
    }
}
```

Reply sent to all other users

``` json
{
    "type": "newUser",
    "user": {
        "id": "id of User101",
        "nickname": "nickname of User101"
    }
}
```

## 👤 User changed his nickname

User1 changed his nickname

Request sent by User1

``` json
{
    "type": "updateNickname"
}
```

Reply sent to everyone (including User1 and others)

``` json
{
    "type": "updateNickname",
    "user": {
        "id": "id of User1",
        "nickname": "new nickname of User1"
    }
}
```


## 🔌 Disconnection Event

When a User disconnects, the backend sends a disconnection event.

Reply sent to all other users

```json
{
    "type": "disconnected",
    "user": {
        "id": "id of disconnected User",
        "nickname": "nickname of disconnected User"
    }
}
```

Note: This event informs all other clients about the disconnection, and they can update their UI accordingly (e.g., removing the user from the online list).

## ❌ Error Handling

In case of an error, the backend replies with an error message

Reply sent to client

```json
{
    "type": "error",
    "errorMessage": "Error Message"
}
```
