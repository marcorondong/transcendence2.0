import {
	signInZodSchema,
	successResponseSchema,
} from "./zodSchemas";

export const signInSchema = {
	summary: "Sign In",
	description: "Sign in a user",
	tags: ["Auth"],
	body: signInZodSchema,
	// response: { 200: successResponseSchema },
};

export const signOutSchema = {
	summary: "Sign Out",
	description: "Sign out a user",
	tags: ["Auth"],
	response: { 200: successResponseSchema },
};

export const healthCheckSchema = {
	summary: "Health Check",
	description: "Check the health of the service",
	tags: ["Auth"],
	response: { 200: successResponseSchema },
};
