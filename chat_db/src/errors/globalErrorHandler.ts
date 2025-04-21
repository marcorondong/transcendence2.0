import { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export function globalErrorHandler(
	error: FastifyError,
	request: FastifyRequest,
	reply: FastifyReply,
) {
	reply.log.error(error, "Error in production");

	if (process.env.NODE_ENV === "production") {
		reply.status(500).send({
			error: "Internal Server Error",
			message: "An unexpected error occurred.",
		});
		return;
	}

	reply.status((error as any).statusCode || 500).send({
		error: error.name || "Internal Server Error",
		message: error.message || "An unexpected error occurred.",
		statusCode: (error as any).statusCode || 500,
		stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
	});
}
