import {
	signInSchema,
	signUpSchema,
	signOutSchema,
	verifyJWTSchema,
	refreshJWTSchema,
	verifyConnectionSchema,
	botJWTSchema,
	editProfileSchema,
	updateProfileSchema,
	deleteUserSchema,
	healthCheckSchema,
} from "./routeSchemas";
import {
	signInHandler,
	signUpHandler,
	signOutHandler,
	verifyJWTHandler,
	refreshJWTHandler,
	verifyConnectionHandler,
	botJWTHandler,
	editProfileHandler,
	updateProfileHandler,
	deleteUserHandler,
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

export const botJWTOpt = {
	schema: botJWTSchema,
	handler: botJWTHandler,
};

export const verifyConnectionOpt = {
	schema: verifyConnectionSchema,
	handler: verifyConnectionHandler,
};

export const editProfileOpt = {
	schema: editProfileSchema,
	handler: editProfileHandler,
};

export const updateProfileOpt = {
	schema: updateProfileSchema,
	handler: updateProfileHandler,
};

export const deleteUserOpt = {
	schema: deleteUserSchema,
	handler: deleteUserHandler,
};

export const healthCheckOpt = {
	schema: healthCheckSchema,
	handler: healthCheckHandler,
};
