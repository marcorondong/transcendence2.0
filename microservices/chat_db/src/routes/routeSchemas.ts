import {
	idZodSchema,
	idsZodSchema,
	blockStatusResponseSchema,
	blockListResponseSchema,
	successResponseSchema,
} from "./zodSchemas";

export const createUserSchema = {
	summary: "Create User",
	description: "Create a new user if not exist.",
	tags: ["Chat-DB"],
	body: idZodSchema,
	response: { 201: successResponseSchema },
};

export const blockUserSchema = {
	summary: "Block User",
	description: "Add a user to the block list.",
	tags: ["Chat-DB"],
	body: idsZodSchema,
	response: { 200: successResponseSchema },
};

export const unblockUserSchema = {
	summary: "Unblock User",
	description: "Remove a user from the block list.",
	tags: ["Chat-DB"],
	body: idsZodSchema,
	response: { 200: successResponseSchema },
};

export const toggleBlockSchema = {
	summary: "Toggle Block User",
	description: "Toggle the block status of a user.",
	tags: ["Chat-DB"],
	body: idsZodSchema,
	response: { 200: successResponseSchema },
};

export const blockStatusSchema = {
	summary: "Block Status",
	description: "Check if a user is blocked.",
	tags: ["Chat-DB"],
	params: idsZodSchema,
	response: { 200: blockStatusResponseSchema },
};

export const blockListSchema = {
	summary: "Block List",
	description: "Get the block list of a user.",
	tags: ["Chat-DB"],
	params: idZodSchema,
	response: { 200: blockListResponseSchema },
};

export const healthCheckSchema = {
	summary: "Health Check",
	description: "Check the health of the service",
	tags: ["Chat-DB"],
	response: { 200: successResponseSchema },
};
