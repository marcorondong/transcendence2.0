import { sessionSchema, sessionResponseSchema, standardSchema, standardResponseSchema, chatHistoryResponseSchema } from "./session.zodSchemas";

export const initializeSchema = {
	body: sessionSchema,
	response: {
		201: sessionResponseSchema,
	},
};

export const terminateSchema = {
	body: sessionSchema,
	response: {
		204: sessionResponseSchema,
	},
};

export const chatHistorySchemaa = {
	body: standardSchema,
	response: {
		200: chatHistoryResponseSchema,
	},
};

export const friendRequestSchemaa = {
	body: standardSchema,
	response: {
		200: standardResponseSchema,
	},
};

export const friendRequestAcceptedSchema = {
	body: standardSchema,
	response: {
		200: standardResponseSchema,
	},
};

export const updateBlockStatusSchema = {
	body: standardSchema,
	response: {
		200: standardResponseSchema,
	},
};

export const inviteToPlaySchema = {
	body: standardSchema,
	response: {
		200: standardResponseSchema,
	},
};

export const acceptPlayInviteSchema = {
	body: standardSchema,
	response: {
		200: standardResponseSchema,
	},
};