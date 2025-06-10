import { FastifyReply, FastifyRequest } from "fastify";

export const USER_ERRORS = {
	USER_CREATE: "USER_CREATE_ERROR",
	USER_LOGIN: "USER_LOGIN_ERROR",
	NOT_FOUND: "USER_NOT_FOUND",
	INVALID_SORT: "INVALID_USER_SORT",
	INVALID_DATE: "INVALID_USER_DATE",
	USER_UPDATE: "USER_UPDATE_ERROR",
	USER_DELETE: "USER_DELETE_ERROR",
	USER_PICTURE: "USER_UPDATE_PICTURE_ERROR",
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

	constructor({
		statusCode = 500,
		code = "APP_ERROR_DEFAULT",
		message = "Unknown error",
		service = SERVICE_NAME || undefined,
		handlerName,
		stack,
	}: {
		statusCode?: number;
		code?: string;
		message?: string;
		service?: string;
		handlerName?: string;
		stack?: string;
	}) {
		super(message);
		this.statusCode = statusCode;
		this.code = code;
		// this.errorType = this.constructor.name;
		this.service = service;
		this.errorType = SERVICE_ERROR_TYPE || this.constructor.name;
		this.handlerName = handlerName;
		if (stack) this.stack = stack;
	}
}

export function errorHandler<
	RequestType extends FastifyRequest = FastifyRequest,
	ReplyType extends FastifyReply = FastifyReply,
>(fn: (req: RequestType, reply: ReplyType) => Promise<unknown>) {
	return async (req: RequestType, reply: ReplyType) => {
		try {
			await fn(req, reply);
		} catch (err: unknown) {
			const name = fn.name || "unknown_handler";
			if (err instanceof AppError) {
				err.handlerName ??= name;
				throw err;
			}
			if (err instanceof Error) {
				throw new AppError({
					statusCode: 500,
					message: err.message || "Unexpected error",
					handlerName: name,
					stack: err.stack,
				});
			}
			throw new AppError({
				statusCode: 500,
				message:
					// So I don't discard / mutate the message
					typeof err === "string"
						? err
						: JSON.stringify(err) || "Unknown error",
				handlerName: name,
			});
		}
	};
}

// Fastify server error handler function registered in app.ts
export function ft_fastifyErrorHandler(
	error: unknown,
	request: FastifyRequest,
	reply: FastifyReply,
) {
	// Custom AppError (E.g., domain-specific errors like "Email exists")
	if (error instanceof AppError) {
		error.handlerName ??= "unknown_handler";
		// Log (terminal) part
		request.log.error({
			statusCode: error.statusCode,
			code: error.code ?? "UNKNOWN_ERROR",
			message: error.message,
			service: error.service,
			type: error.errorType,
			handler: error.handlerName,
			stack: error.stack,
		});
		// Reply (curl, Postman, Swagger) part
		return reply.code(error.statusCode).send({
			statusCode: error.statusCode,
			code: error.code ?? "UNKNOWN_ERROR",
			message: error.message,
			// Don't send these. Already printed in the terminal.
			// If I send them, I'm exposing internal code structure.
			// service: error.service,
			// type: error.errorType,
			// handler: error.handlerName,
			// stack: error.stack,
			// Note that these values are "filtered" by `errorResponseSchema`
		});
	}
	// Unknown/unexpected error
	request.log.error({
		// to access '.message' and '.stack' safely, I have to cast it,
		// And '?.' ensures that if error is not an object or has no .message or .stack, it won’t crash.
		message:
			// So I don't discard / mutate the message
			typeof error === "string"
				? error
				: JSON.stringify(error) || "Unhandled exception",
		stack: (error as any)?.stack,
	});
	return reply.send(error);
}
