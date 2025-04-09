import {
	initializeUserSession,
	terminateUserSession,
	provideChatHistory,
	provideNotifications,
	friendRequest,
	friendRequestAccepted,
	updateBlockStatus,
	inviteToPlay,
	acceptPlayInvite,
} from "./session.controllers";
import {
	initializeSchema,
	terminateSchema,
	chatHistorySchema,
	notificationSchema,
	friendRequestSchema,
	friendRequestAcceptedSchema,
	updateBlockStatusSchema,
	inviteToPlaySchema,
	acceptPlayInviteSchema,
} from "./session.routeSchemas";

export const initializeOpt = {
	schema: initializeSchema,
	handler: initializeUserSession,
};

export const terminateOpt = {
	schema: terminateSchema,
	handler: terminateUserSession,
};

export const chatHistoryOpt = {
	schema: chatHistorySchema,
	handler: provideChatHistory,
};

export const notificationsOpt = {
	schema: notificationSchema,
	handler: provideNotifications,
};

export const friendRequestOpt = {
	schema: friendRequestSchema,
	handler: friendRequest,
};

export const friendRequestAcceptedOpt = {
	schema: friendRequestAcceptedSchema,
	handler: friendRequestAccepted,
};

export const updateBlockStatusOpt = {
	schema: updateBlockStatusSchema,
	handler: updateBlockStatus,
};

export const inviteToPlayOpt = {
	schema: inviteToPlaySchema,
	handler: inviteToPlay,
};

export const acceptPlayInviteOpt = {
	schema: acceptPlayInviteSchema,
	handler: acceptPlayInvite,
};
