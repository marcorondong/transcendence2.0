import { FastifyReply, FastifyRequest } from "fastify";

export const USER_ERRORS = {
	USER_CREATE: "USER_CREATE_ERROR",
	USER_LOGIN: "USER_LOGIN_ERROR",
	NOT_FOUND: "USER_NOT_FOUND",
	INVALID_SORT: "INVALID_USER_SORT",
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

export class AppError extends Error {
	// Used '?' only for fields that might not be defined when error is thrown.
	public statusCode: number;
	public code: string;
	public errorType: string; // Error categorization. Default is class name (AppError)
	public handlerName?: string; // Error tracing. Indicate function which triggered error

	constructor({
		statusCode = 500,
		code = "APP_ERROR_DEFAULT",
		message = "Unknown error",
		handlerName,
	}: {
		// All have '?' because we defined defaults in constructor
		statusCode?: number;
		code?: string;
		message?: string;
		handlerName?: string;
	}) {
		super(message);
		this.statusCode = statusCode;
		this.code = code;
		this.errorType = this.constructor.name;
		this.handlerName = handlerName;
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
					message: err.message,
					handlerName: name,
				});
			}
			throw new AppError({
				statusCode: 500,
				message: "Unknown error",
				handlerName: name,
			});
		}
	};
}
