import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

// FIXME: This should be refactored. THe errors should caught by AUTH should not be discarded / mutated.
export function globalErrorHandler(
	error: unknown,
	request: FastifyRequest,
	reply: FastifyReply,
) {
	reply.log.error(error);

	const fastifyError = error as FastifyError & { expose?: boolean };

	if (process.env.NODE_ENV === "production" && !fastifyError.expose) {
		reply.status(503).send({
			error: "Service Unavailable",
			message:
				"Requested service is not available right now. Please try again later.",
		});
		return;
	}
	const statusCode = fastifyError.statusCode || 500;
	reply.status(statusCode).send({
		error: fastifyError.name || "Internal Server Error",
		message: fastifyError.message || "An unexpected error occurred.",
		statusCode: statusCode,
		stack: fastifyError.stack,
	});
}
