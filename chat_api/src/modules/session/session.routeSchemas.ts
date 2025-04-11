import {
	sessionZodSchema,
	sessionZodResponseSchema,
	standardZodSchema,
	standardZodResponseSchema,
	chatHistoryResponseSchema,
	notificationResponseSchema,
} from "./session.zodSchemas";

export const initializeSchema = {
	summary: "Initialize User Session",
	description:
		"Initialize a user session with the provided username. It loads the user data from database to memory if exist or creates new database entry.",
	tags: ["Session"],
	body: sessionZodSchema,
	response: {
		201: sessionZodResponseSchema,
	},
};

export const terminateSchema = {
	summary: "Terminate User Session",
	description: "Terminate a user session with the provided username.",
	tags: ["Session"],
	body: sessionZodSchema,
	response: {
		204: sessionZodResponseSchema,
	},
};

export const chatHistorySchema = {
	body: standardZodSchema,
	response: {
		200: chatHistoryResponseSchema,
	},
};

export const notificationSchema = {
	body: sessionZodSchema,
	response: {
		200: notificationResponseSchema,
	},
};

export const friendRequestSchema = {
	body: standardZodSchema,
	response: {
		200: standardZodResponseSchema,
	},
};

export const friendRequestAcceptedSchema = {
	body: standardZodSchema,
	response: {
		200: standardZodResponseSchema,
	},
};

export const updateBlockStatusSchema = {
	body: standardZodSchema,
	response: {
		200: standardZodResponseSchema,
	},
};

export const inviteToPlaySchema = {
	body: standardZodSchema,
	response: {
		200: standardZodResponseSchema,
	},
};

export const acceptPlayInviteSchema = {
	body: standardZodSchema,
	response: {
		200: standardZodResponseSchema,
	},
};
