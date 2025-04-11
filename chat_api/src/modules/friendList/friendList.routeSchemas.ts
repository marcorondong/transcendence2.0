import {
	getFriendListResponseSchema,
	standardFriendListZodSchema,
} from "./friendList.zodSchemas";

export const getFriendListSchema = {
	summary: "Get Friend List",
	description: "Retrieve the list of friends for a given user.",
	tags: ["Friend List"],
	response: {
		200: getFriendListResponseSchema,
	},
};

export const addFriendSchema = {
	summary: "Add Friend",
	description: "Add a friend to the user's friend list.",
	tags: ["Friend List"],
	body: standardFriendListZodSchema,
};

export const updateBlockStatusSchema = {
	summary: "Update Block Status",
	description: "Update the block status of a friend.",
	tags: ["Friend List"],
	body: standardFriendListZodSchema,
};
