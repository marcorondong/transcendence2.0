
Protocol for Front End for now

expected_data -> data which is send from frontend to chat backend
expected_answer -> data which is answered to request

1) Message someone (user1 -> user2)

expected_data from user1 -> {"message": "any message", recipientId: "UUID of user2"}

expected_answer for user1 -> {"message": "any message", senderId: "UUID of user1"} for user1
expected_answer for user1 -> {"message": "any message", senderId: "UUID of user1"} for user2

Note: in case user2 blocked user1, user2 will receive nothing

2) Block (user1 -> user2)

send_data -> {"block": true, recipientId: "UUID of user"}

expected_data -> {block: true} for user1

3) Invite someone (user1 -> user2)

expected_data from user1 -> {"invite": true, recipientId: "UUID of user2"}

no expected_data for user1 (can be added if needed)
expected_data for user2 -> {"invite": true, senderId: "UUID of user1"}

4) Invite Accepted (user2 -> user1 assuming user2 accept user1 invitation)

expected_data from user2 -> { "inviteAccepted": true, recipientId: "UUID of user1"}

expected_answer for user1 -> { "openSocket": true, senderId: user2 }

After socket connection is establish for user1, user1 should inform backend

expected_data from user1 -> { "socketOpened": true, recipientId: "UUID of user2" }

expected_answer for user2 -> { "joinRoom": true, "roomId": "room id to send in params}



