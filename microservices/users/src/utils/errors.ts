import { FastifyReply, FastifyRequest } from "fastify";
import { logger } from "./logger";

export const CONFIG_ERRORS = {
	ROOT_FOLDER: "ROOT_FOLDER_ERROR",
	NOT_FOUND: "VALUE_NOT_FOUND_ERROR",
};

export const USER_ERRORS = {
	CREATE: "USER_CREATE_ERROR",
	LOGIN: "USER_LOGIN_ERROR",
	NOT_FOUND: "USER_NOT_FOUND_ERROR",
	INVALID_SORT: "INVALID_USER_SORT_ERROR",
	INVALID_DATE: "INVALID_USER_DATE_ERROR",
	INVALID_QUERY: "INVALID_USER_QUERY_ERROR",
	CONSTRAINTS: "CONSTRAINTS_USER_ERROR",
	UPDATE: "USER_UPDATE_ERROR",
	DELETE: "USER_DELETE_ERROR",
	PICTURE: "USER_UPDATE_PICTURE_ERROR",
	// ALREADY_EXISTS: "FIELD_VALUE_ALREADY_EXISTS",
	// INVALID_KEY: "INVALID_FOREIGN_KEY",
};

export const FRIENDSHIP_ERRORS = {
	SELF: "FRIENDSHIP_SELF_ERROR",
	ALREADY: "FRIENDSHIP_ALREADY_ERROR",
	NOT_FOUND: "FRIENDSHIP_NOT_FOUND_ERROR",
	GET: "GET_FRIENDSHIP_ERROR",
	ADD: "ADD_FRIENDSHIP_ERROR",
	DELETE: "DELETE_FRIENDSHIP_ERROR",
	// NOT_FOUND: "USER_NOT_FOUND",
	// ALREADY_EXISTS: "FIELD_VALUE_ALREADY_EXISTS",
	// INVALID_KEY: "INVALID_FOREIGN_KEY",
};

export const FRIEND_REQUEST_ERRORS = {
	CREATE: "FRIEND_REQ_CREATE_ERROR",
	NOT_FOUND: "FRIEND_REQ_NOT_FOUND_ERROR",
	SELF: "FRIEND_REQ_SELF_ERROR",
	ALREADY: "FRIEND_REQ_ALREADY_ERROR",
	INVALID_SORT: "INVALID_FRIEND_REQ_SORT_ERROR",
	INVALID_DATE: "INVALID_FRIEND_REQ_DATE_ERROR",
	INVALID_QUERY: "INVALID FRIEND_REQ_QUERY_ERROR",
	// DELETE_FRIEND: "DELETE_FRIEND_ERROR",
	// NOT_FOUND: "USER_NOT_FOUND",
	// ALREADY_EXISTS: "FIELD_VALUE_ALREADY_EXISTS",
	// INVALID_KEY: "INVALID_FOREIGN_KEY",
};

export const PRODUCT_ERRORS = {
	PRODUCT_CREATE: "PRODUCT_CREATE_ERROR",
	PRODUCT_LOGIN: "PRODUCT_LOGIN_ERROR",
	NOT_FOUND: "PRODUCT_NOT_FOUND",
	// ALREADY_EXISTS: "FIELD_VALUE_ALREADY_EXISTS",
	// INVALID_KEY: "INVALID_FOREIGN_KEY",
};

const SERVICE_NAME = "users"; // Replace with your actual service name or keep as ""
const SERVICE_ERROR_TYPE = "UsersError"; // Replace with your actual service name or keep as "" to use "AppError"

export class AppError extends Error {
	// Used '?' only for fields that might not be defined when error is thrown.
	public statusCode: number;
	public code: string;
	public service?: string; // Error origin service. E.g: users, pong, chat
	public errorType: string; // Error categorization. Default is class name (AppError)
	public handlerName?: string; // Error tracing. Indicate function which triggered error
	public nestedCause?: unknown; // Error chaining/nesting (to preserve original error)

	constructor({
		statusCode = 500,
		code = "APP_ERROR_DEFAULT",
		message = "Unknown error",
		service = SERVICE_NAME || undefined,
		handlerName,
		stack,
		nestedCause,
	}: {
		statusCode?: number;
		code?: string;
		message?: string;
		service?: string;
		handlerName?: string;
		stack?: string;
		nestedCause?: unknown;
	}) {
		super(message);
		this.statusCode = statusCode;
		this.code = code;
		this.service = service;
		this.errorType = SERVICE_ERROR_TYPE || this.constructor.name;
		this.handlerName = handlerName;
		if (stack) this.stack = stack;
		this.nestedCause = nestedCause; // Store original error
	}
}

export function appErrorHandler<
	RequestType extends FastifyRequest = FastifyRequest,
	ReplyType extends FastifyReply = FastifyReply,
>(fn: (req: RequestType, reply: ReplyType) => Promise<unknown>) {
	return async (req: RequestType, reply: ReplyType) => {
		try {
			await fn(req, reply);
			// Catch everything
		} catch (err: unknown) {
			const name = fn.name || "unknown_handler";
			// If I caught an AppError
			if (err instanceof AppError) {
				err.handlerName ??= name;
				throw err;
			}
			// If I caught an Error
			if (err instanceof Error) {
				throw new AppError({
					statusCode: 500,
					message: err.message || "Unexpected error",
					handlerName: name,
					stack: err.stack,
					nestedCause: err, // Capture original error
				});
			}
			// If I caught something else (e.g: throw "simple string", 42, or { foo: "bar" })
			throw new AppError({
				statusCode: 500,
				message:
					// So I don't discard / mutate the message
					typeof err === "string"
						? err
						: JSON.stringify(err) || "Unknown error",
				handlerName: name,
				nestedCause: err, // Capture unknown value too
			});
		}
	};
}

const ERROR_CAUSE_DEPTH = 3; // To limit how deep a nested error will be logged

// Helper function for ft_fastifyErrorHandler to log nested causes (deep nested errors)
function extractCauses(err: unknown, depth = ERROR_CAUSE_DEPTH): any {
	if (!(err instanceof Error) || depth <= 0) return null;
	return {
		// Add or comment-out fields
		name: err.name,
		message: err.message,
		// stack: err.stack,
		// nestedCause: extractCauses((err as any).nestedCause, depth - 1),
	};
}

// Fastify server error handler function registered in app.ts
export function ft_fastifyErrorHandler(
	err: unknown,
	request: FastifyRequest,
	reply: FastifyReply,
) {
	// Custom AppError (E.g., domain-specific errors like "Email exists")
	if (err instanceof AppError) {
		err.handlerName ??= "unknown_handler";
		// Log (terminal) part
		// request.log.error({ // This line uses fastify default request.log
		logger.from(request).error({
			statusCode: err.statusCode,
			code: err.code ?? "UNKNOWN_ERROR",
			message: err.message,
			service: err.service,
			type: err.errorType,
			handler: err.handlerName,
			stack: err.stack,
		});
		// Optional: Log nested error if cause is another Error
		if (err.nestedCause instanceof Error) {
			// request.log.error({
			logger
				.from(request)
				.error({ nestedCause: extractCauses(err.nestedCause) });
		}
		// Reply (curl, Postman, Swagger) part
		return reply.code(err.statusCode).send({
			statusCode: err.statusCode,
			code: err.code ?? "UNKNOWN_ERROR",
			message: err.message,
			// Don't send these. Already printed in the terminal.
			// If I send them, I'm exposing internal code structure.
			// service: err.service,
			// type: err.errorType,
			// handler: err.handlerName,
			// stack: err.stack,
			// nestedCause: extractCauses(err.nestedCause, ERROR_CAUSE_DEPTH),
			// Note that these values are "filtered" by `errorResponseSchema`
		});
	}
	// Unknown/unexpected error
	// request.log.error({ // This line uses fastify default request.log
	logger.from(request).error({
		// to access '.message' and '.stack' safely, I have to cast it,
		// And '?.' ensures that if error is not an object or has no .message or .stack, it won’t crash.
		message:
			// So I don't discard / mutate the message
			typeof err === "string"
				? err
				: JSON.stringify(err) || "Unhandled exception",
		stack: (err as any)?.stack,
	});
	// return reply.send(err);
	const statusCode =
		typeof (err as any)?.statusCode === "number" &&
		(err as any).statusCode >= 400 &&
		(err as any).statusCode < 600
			? (err as any).statusCode
			: 500;

	return reply.code(statusCode).send({
		statusCode,
		code: (err as any)?.code ?? "UNHANDLED_ERROR",
		message:
			typeof err === "string"
				? err
				: (err as any)?.message || "Unhandled exception",
	});
}
