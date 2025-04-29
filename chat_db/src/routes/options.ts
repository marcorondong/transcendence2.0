import {
	createUserSchema,
	blockUserSchema,
	unblockUserSchema,
	blockStatusSchema,
	blockListSchema,
	healthCheckSchema,
} from "./routeSchemas";
import {
	createUserHandler,
	blockUserHandler,
	unblockUserHandler,
	blockStatusHandler,
	blockListHandler,
	healthCheckHandler,
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

export const healthCheckOpt = {
	schema: healthCheckSchema,
	handler: healthCheckHandler,
};
