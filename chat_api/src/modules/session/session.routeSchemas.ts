import {
	sessionZodSchema,
	sessionZodResponseSchema,
	standardZodSchema,
	standardZodResponseSchema,
	chatHistoryResponseSchema,
} from "./session.zodSchemas";

export const initializeSchema = {
	body: sessionZodSchema,
	response: {
		201: sessionZodResponseSchema,
	},
};

export const terminateSchema = {
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
