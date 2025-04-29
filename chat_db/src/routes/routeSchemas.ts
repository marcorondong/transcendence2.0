import {
	idZodSchema,
	idsZodSchema,
	blockStatusResponseSchema,
	blockListResponseSchema,
	successResponseSchema,
} from "./zodSchemas";

export const createUserSchema = {
	summary: "Create User",
	description: "Create a new user. If the user already exists, it will be ignored.",
	tags: ["Chat"],
	body: idZodSchema,
	response: { 201: blockListResponseSchema },
};

export const blockUserSchema = {
	summary: "Block User",
	description: "Add a user to the block list.",
	tags: ["Chat"],
	body: idsZodSchema,
	response: { 200: successResponseSchema },
};

export const unblockUserSchema = {
	summary: "Unblock User",
	description: "Remove a user from the block list.",
	tags: ["Chat"],
	body: idsZodSchema,
	response: { 200: successResponseSchema },
};

export const toggleBlockSchema = {
	summary: "Toggle Block User",
	description: "Toggle the block status of a user.",
	tags: ["Chat"],
	body: idsZodSchema,
	response: { 200: successResponseSchema },
};

export const blockStatusSchema = {
	summary: "Block Status",
	description: "Check if a user is blocked.",
	tags: ["Chat"],
	params: idsZodSchema,
	response: { 200: blockStatusResponseSchema },
};

export const blockListSchema = {
	summary: "Block List",
	description: "Get the block list of a user.",
	tags: ["Chat"],
	params: idZodSchema,
	response: { 200: blockListResponseSchema },
};

export const healthCheckSchema = {
	summary: "Health Check",
	description: "Check the health of the service",
	tags: ["Health"],
	response: { 200: successResponseSchema },
};
