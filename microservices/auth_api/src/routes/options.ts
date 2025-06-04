import {
	signInSchema,
	signUpSchema,
	signOutSchema,
	verifyJWTSchema,
	refreshJWTSchema,
	verifyConnectionSchema,
	botJWTSchema,
	// editProfileSchema, // AUTH will only handle cookies/jwt management it should intercept calls
	// updateProfileSchema, // AUTH will only handle cookies/jwt management it should intercept calls
	// deleteUserSchema, // AUTH will only handle cookies/jwt management it should intercept calls
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
	// editProfileHandler, // AUTH will only handle cookies/jwt management it should intercept calls
	// updateProfileHandler, // AUTH will only handle cookies/jwt management it should intercept calls
	// deleteUserHandler, // AUTH will only handle cookies/jwt management it should intercept calls
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

// TODO: This won't be handled by AUTH. And will have major refactoring to limit scope (only handling cookies/jwt)
// export const editProfileOpt = {
// 	schema: editProfileSchema,
// 	handler: editProfileHandler,
// };

// export const updateProfileOpt = {
// 	schema: updateProfileSchema,
// 	handler: updateProfileHandler,
// };

// export const deleteUserOpt = {
// 	schema: deleteUserSchema,
// 	handler: deleteUserHandler,
// };

export const healthCheckOpt = {
	schema: healthCheckSchema,
	handler: healthCheckHandler,
};
