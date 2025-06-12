import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { env } from "./env";

export function globalErrorHandler(
	error: FastifyError,
	request: FastifyRequest,
	reply: FastifyReply,
) {
	reply.log.error(error);
	if (env.NODE_ENV === "production") {
		reply.status(503).send({
			error: "Service Unavailable",
			message:
				"Requested service is not available right now. Please try again later.",
		});
		return;
	}
	const statusCode = error.statusCode || 500;
	reply.status(statusCode).send({
		statusCode: statusCode,
		error: error.name || "Internal Server Error",
		message: error.message || "An unexpected error occurred.",
		// stack: fastifyError.stack,
	});
}
