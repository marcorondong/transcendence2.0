import type { FastifyReply, FastifyRequest } from "fastify";

import {
	signInRequest,
	signUpRequest,
	setCookieOpt,
	jwtSignOpt,
	clearCookieOpt,
} from "./service";
import { env } from "../utils/env";

export async function signInHandler(
	request: FastifyRequest<{ Body: Record<string, unknown> }>,
	reply: FastifyReply,
) {
	const payload = await signInRequest(request.body);
	const accessToken = await reply.jwtSign(payload, jwtSignOpt);
	reply.setCookie(env.JWT_TOKEN_NAME, accessToken, setCookieOpt);
	reply.status(200).send();
}

export async function signUpHandler(
	request: FastifyRequest<{ Body: Record<string, unknown> }>,
	reply: FastifyReply,
) {
	const payload = await signUpRequest(request.body);
	const accessToken = await reply.jwtSign(payload, jwtSignOpt);
	reply.setCookie(env.JWT_TOKEN_NAME, accessToken, setCookieOpt);
	reply.status(200).send();
}

export async function signOutHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	reply.clearCookie(env.JWT_TOKEN_NAME, clearCookieOpt);
	// return reply.status(200).send({ success: true });
	reply.status(200).send();
}

export async function verifyJWTHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	// reply.status(200).send({ success: true });
	reply.status(200).send();
}

export async function refreshJWTHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const payload = { id: request.user.id, nickname: request.user.nickname };
	const accessToken = await reply.jwtSign(payload, jwtSignOpt);
	reply.setCookie(env.JWT_TOKEN_NAME, accessToken, setCookieOpt);
	// reply.status(200).send({ success: true });
	reply.status(200).send();
}

export async function verifyConnectionHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { id, nickname } = request.user;
	reply.status(200).send({ id, nickname });
}

export async function healthCheckHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	// reply.status(200).send({ success: true });
	reply.status(200).send();
}
