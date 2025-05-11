import {
	signInSchema,
	signOutSchema,
	verifyJWTSchema,
	healthCheckSchema,
} from "./routeSchemas";
import {
	signInHandler,
	signOutHandler,
	verifyJWTHandler,
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

export const verifyJWTOpt = {
	schema: verifyJWTSchema,
	handler: verifyJWTHandler,
};

export const healthCheckOpt = {
	schema: healthCheckSchema,
	handler: healthCheckHandler,
};