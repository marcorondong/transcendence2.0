import { chatHistorySchema } from "./chatHistory.routeSchemas";
import { provideChatHistory } from "./chatHistory.controllers";

export const chatHistoryOpt = {
	schema: chatHistorySchema,
	handler: provideChatHistory,
};
