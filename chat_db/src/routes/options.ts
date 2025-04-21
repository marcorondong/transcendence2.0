import {
	createUserSchema,
	blockUserSchema,
	unblockUserSchema,
	blockStatusSchema,
	blockListSchema,
} from "./routeSchemas";
import {
	createUserHandler,
	blockUserHandler,
	unblockUserHandler,
	blockStatusHandler,
	blockListHandler,
} from "./controllers";

export const createUserOpt = {
	schema: createUserSchema,
	handler: createUserHandler,
};

export const blockUserOpt = {
	schema: blockUserSchema,
	handler: blockUserHandler,
};

export const unblockUserOpt = {
	schema: unblockUserSchema,
	handler: unblockUserHandler,
};

export const blockStatusOpt = {
	schema: blockStatusSchema,
	handler: blockStatusHandler,
};

export const blockListOpt = {
	schema: blockListSchema,
	handler: blockListHandler,
};
