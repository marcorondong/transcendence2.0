import {
	signInBodyShape,
	signUpBodyShape,
	payloadResponseShape,
} from "./shapeSchemas";

// TODO: delete all body parts in production although they are just for documentation purposes
export const signInSchema = {
	summary: "Sign In",
	description: "Sign in a user. This will create the token for the user.",
	tags: ["Auth"],
	body: signInBodyShape,
};

export const signUpSchema = {
	summary: "Sign Up",
	description: "Sign up a user. This will create the user and the token.",
	tags: ["Auth"],
	body: signUpBodyShape,
};

export const signOutSchema = {
	summary: "Sign Out",
	description: "Sign out a user. This will delete the token for the user.",
	tags: ["Auth"],
};

export const verifyJWTSchema = {
	summary: "Verify",
	description: "Verify a user. This will check if the token is valid.",
	tags: ["Auth"],
};

export const refreshJWTSchema = {
	summary: "Refresh",
	description: "Refresh a user. This will refresh the token for the user.",
	tags: ["Auth"],
};

export const verifyConnectionSchema = {
	summary: "Verify Cookies and JWT for internal services",
	description: "Verify Cookies and JWT for internal services",
	tags: ["Auth"],
	response: { 200: payloadResponseShape },
};

export const healthCheckSchema = {
	summary: "Health Check",
	description: "Check the health of the service",
	tags: ["Auth"],
};
