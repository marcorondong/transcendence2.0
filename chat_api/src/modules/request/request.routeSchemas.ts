import { requestZodSchema } from "./request.zodSchemas";

export const friendRequestSchema = {
	summary: "Friend Request",
	description: "Send a friend request to another user.",
	tags: ["Requests"],
	body: requestZodSchema,
};

export const gameRequestSchema = {
	summary: "Game Request",
	description: "Send a game request to another user.",
	tags: ["Requests"],
	body: requestZodSchema,
};
