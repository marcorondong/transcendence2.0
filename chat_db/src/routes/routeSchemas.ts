import {
	idZodSchema,
	idsZodSchema,
	blockStatusResponseSchema,
	blockListResponseSchema,
	// chatHistoryResponseSchema,
} from "./zodSchemas";

export const createUserSchema = {
	summary: "Create User",
	description: "Create a new user.",
	tags: ["Chat"],
	body: idZodSchema,
};

export const blockUserSchema = {
	summary: "Block User",
	description: "Add a user to the block list.",
	tags: ["Chat"],
	body: idsZodSchema,
};

export const unblockUserSchema = {
	summary: "Unblock User",
	description: "Remove a user from the block list.",
	tags: ["Chat"],
	body: idsZodSchema,
};

export const blockStatusSchema = {
	summary: "Block Status",
	description: "Check if a user is blocked.",
	tags: ["Chat"],
	params: idsZodSchema,
	response: {
		200: blockStatusResponseSchema,
	}
};

export const blockListSchema = {
	summary: "Block List",
	description: "Get the block list of a user.",
	tags: ["Chat"],
	params: idZodSchema,
	response: {
		200: blockListResponseSchema,
	},
};

// export const chatHistorySchema = {
// 	summary: "Chat History",
// 	description: "Get the chat history of a user.",
// 	tags: ["Chat"],
// 	params: idsZodSchema,
// 	response: {
// 		200: chatHistoryResponseSchema,
// 	},
// };

