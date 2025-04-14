
Protocol for Front End for now

request -> request of frontend (frontend sends request)
reply -> reply of backend (frontend receives reply of backend)


1) Message someone (user1 sends message to user2)

request from user1 -> {"message": "any message", "relatedId": "UUID of user2"}

reply for user1 -> {"message": "any message", senderId: "UUID of user1"} for user1
reply for user1 -> {"message": "any message", senderId: "UUID of user1"} for user2

Note: in case user2 blocked user1, user2 will receive nothing

2) Block (user1 blocks/unblocks user2)

request from user1 -> {"block": true, "relatedId": "UUID of user2"}

reply for user1  -> {block: true, "relatedId": "UUID of user2"}
no reply for user2 (can be added if needed)

3) Invite someone (user1 invites user2)

request from user1 -> {"invite": true, "relatedId": "UUID of user2"}

no reply for user1 (can be added if needed)
reply for user2 -> {"invite": true, "relatedId": "UUID of user1"}

4) Invite Accepted (user2 -> user1 assuming user2 accept user1 invitation)

request from user2 -> { "inviteAccepted": true, "relatedId": "UUID of user1"}

reply for user1 -> { "openSocket": true, "relatedId": "UUID of user2" }

Note: After socket connection is establish for user1, user1 should inform backend

request from user1 -> { "socketOpened": true, "relatedId": "UUID of user2" }

reply for user2 -> { "joinRoom": true, "roomId": "room id to to build connection with}

5) New Client ( new client user101 joined)

reply for user101 -> { "peopleOnline": "array of all online people" }
reply for all other users -> { "newClient": "UUID of user101",} 


<!-- 1) Message someone (user1 sends message to user2)

request from user1 -> {"message": "any message", recipientId: "UUID of user2"}

reply for user1 -> {"message": "any message", senderId: "UUID of user1"} for user1
reply for user1 -> {"message": "any message", senderId: "UUID of user1"} for user2

Note: in case user2 blocked user1, user2 will receive nothing

2) Block (user1 blocks/unblocks user2)

request from user1 -> {"block": "UUID of user2"}

reply for user1  -> {block: "UUID of user2"}
no reply for user2

3) Invite someone (user1 invites user2)

request from user1 -> {"invite": "UUID of user2"}

no reply for user1 (can be added if needed)
reply for user2 -> {"invite": "UUID of user1"}

4) Invite Accepted (user2 -> user1 assuming user2 accept user1 invitation)

request from user2 -> { "inviteAccepted": "UUID of user1"}

reply for user1 -> { "openSocket": "UUID of user2" }

Note: After socket connection is establish for user1, user1 should inform backend

request from user1 -> { "socketOpened": "UUID of user2" }

reply for user2 -> { "joinRoom": "room id to send in params} -->



