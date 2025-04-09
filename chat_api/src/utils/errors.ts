import { FastifyRequest, FastifyReply } from "fastify";

export function errorHandler(
	err: Error,
	req: FastifyRequest,
	res: FastifyReply,
) {
	if (err) {
		res.status(400).send({
			statusCode: 400,
			error: "Bad Request",
			message: "Invalid request data",
		});
	} else {
		res.status(500).send({
			statusCode: 500,
			error: "Internal Server Error",
			message: "An unexpected error occurred",
		});
	}
}
