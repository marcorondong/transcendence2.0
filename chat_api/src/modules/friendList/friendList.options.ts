import {
	getFriendListSchema,
	addFriendSchema,
	updateBlockStatusSchema,
} from "./friendList.routeSchemas";
import {
	getFriendList,
	addFriend,
	updateBlockStatus,
} from "./friendList.controllers";

export const getFriendListOpt = {
	schema: getFriendListSchema,
	handler: getFriendList,
};

export const addFriendOpt = {
	schema: addFriendSchema,
	handler: addFriend,
};

export const updateBlockStatusOpt = {
	schema: updateBlockStatusSchema,
	handler: updateBlockStatus,
};
