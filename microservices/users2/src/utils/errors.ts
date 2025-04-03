import { FastifyReply, FastifyRequest } from "fastify";

export class AppError extends Error {
	public statusCode: number;
	public errorType: string; // Error categorization. Default is class name (AppError)
	public handlerName?: string; // Error tracing. Indicate function which triggered error

	constructor(
		statusCode = 500,
		message: string = "Unknown error",
		handlerName?: string,
	) {
		super(message);
		this.statusCode = statusCode;
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
				throw new AppError(500, err.message, name);
			}
			throw new AppError(500, "Unknown error", name);
		}
	};
}
