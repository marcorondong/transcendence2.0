export const m = {
	notInitialized: "Warning: user is not initialized",
	alreadyFriends: "Warning: Already friends",
	notFriends: "Warning: Users are not friends",
	notInvited: "Warning: User is not invited",
	unblock: "Friend unblocked and saved to database",
	block: "Friend blocked and saved to database",
	isBlocked: "Warning: User is blocked",
	userNotFound: "Warning: Friend does not exist",
	invalid: "Warning: userName and friendName cannot be the same",
	successMsg: "Successfully done",
	internalServerError: "Internal server error",
	selfRequest: "Warning: You cannot send a friend request to yourself",
	reqUserNotif: (userName: string) =>
		`${userName} has been invited to be your friend`,
	reqFriendNotif: (userName: string) => `${userName} has invited you to be friends`,
	acceptUserNotif: (userName: string) =>
		`${userName}'s friend request has been accepted`,
	acceptFriendNotif: (userName: string) =>
		`${userName} has accepted your friend request`,
	inviteUserNotif: (userName: string) =>
		`${userName} has been invited to play`,
	inviteFriendNotif: (userName: string) =>
		`${userName} has invited you to play`,
	playUserNotif: (userName: string) =>
		`${userName}'s invite has been accepted`,
	playFriendNotif: (userName: string) =>
		`${userName} has accepted your invite`,
};
