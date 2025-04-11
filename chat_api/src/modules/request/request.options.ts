import { friendRequestSchema, gameRequestSchema } from "./request.routeSchemas";
import { friendRequest, gameRequest } from "./request.controllers";

export const friendRequestOpt = {
	schema: friendRequestSchema,
	handler: friendRequest,
};

export const gameRequestOpt = {
	schema: gameRequestSchema,
	handler: gameRequest,
};
