import {
	chatHistoryZodSchema,
	chatHistoryResponseZodSchema,
} from "./chatHistory.zodSchemas";

export const chatHistorySchema = {
	summary: "Chat History",
	description: "Get the chat history of a user.",
	tags: ["Chat History"],
	response: {
		200: chatHistoryResponseZodSchema,
	},
};
