import {
	signInSchema,
	signUpSchema,
	signOutSchema,
	verifyJWTSchema,
	refreshJWTSchema,
	verifyConnectionSchema,
	healthCheckSchema,
} from "./routeSchemas";
import {
	signInHandler,
	signUpHandler,
	signOutHandler,
	verifyJWTHandler,
	refreshJWTHandler,
	verifyConnectionHandler,
	healthCheckHandler,
} from "./controllers";

export const signInOpt = {
	schema: signInSchema,
	handler: signInHandler,
};

export const signUpOpt = {
	schema: signUpSchema,
	handler: signUpHandler,
};

export const signOutOpt = {
	schema: signOutSchema,
	handler: signOutHandler,
};

export const verifyJWTOpt = {
	schema: verifyJWTSchema,
	handler: verifyJWTHandler,
};

export const refreshJWTOpt = {
	schema: refreshJWTSchema,
	handler: refreshJWTHandler,
};

export const verifyConnectionOpt = {
	schema: verifyConnectionSchema,
	handler: verifyConnectionHandler,
};

export const healthCheckOpt = {
	schema: healthCheckSchema,
	handler: healthCheckHandler,
};
