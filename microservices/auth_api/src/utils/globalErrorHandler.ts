import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { env } from "./env";
import { clearCookieOpt } from "../routes/configs";

export function globalErrorHandler(
	error: FastifyError,
	request: FastifyRequest,
	reply: FastifyReply,
) {
	reply.log.error(error);
	reply.clearCookie(env.JWT_TOKEN_NAME, clearCookieOpt);
	
	if (error instanceof TypeError && error.message.includes("fetch failed")) {
		return reply.status(502).send({
			statusCode: 502,
			error: "Bad Gateway",
			message: "Couldn't reach upstream service. Please try again later.",
		});
	}

	if (error.validation || error instanceof ZodError) {
		return reply.status(400).send({
			statusCode: 400,
			error: "Bad Request",
			message: "Bad Request. Please check your input.",
		});
	}

	return reply.status(500).send({
		statusCode: 500,
		error: "Internal Server Error",
		message: "Something went wrong. Please try again later.",
	});
}
