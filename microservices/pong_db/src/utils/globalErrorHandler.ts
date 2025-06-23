import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export function globalErrorHandler(
	error: FastifyError,
	request: FastifyRequest,
	reply: FastifyReply,
) {
	reply.log.error(error);
	reply.status(503).send({
		statusCode: 503,
		error: "Service Unavailable",
		message: "Service is not available right now. Please try again later.",
	});
}
