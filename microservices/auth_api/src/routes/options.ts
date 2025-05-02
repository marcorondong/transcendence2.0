import {
	signInSchema,
	signOutSchema,
	healthCheckSchema,
} from "./routeSchemas";
import {
	signInHandler,
	signOutHandler,
	healthCheckHandler,
} from "./controllers";

export const signInOpt = {
	schema: signInSchema,
	handler: signInHandler,
};

export const signOutOpt = {
	schema: signOutSchema,
	handler: signOutHandler,
};

export const healthCheckOpt = {
	schema: healthCheckSchema,
	handler: healthCheckHandler,
};
