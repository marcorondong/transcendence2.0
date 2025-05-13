import type { FastifyReply, FastifyRequest } from "fastify";
import type { SignInInput } from "./zodSchemas";
import {
	signInRequest,
} from "./service";

export async function signInHandler(
	request: FastifyRequest<{ Body: SignInInput }>,
	reply: FastifyReply,
) {
	const { email, password } = request.body;
	const payload = await signInRequest(email, password);
	const accessToken = await reply.jwtSign(payload, {expiresIn: "1h"});
	reply.setCookie("access_token", accessToken, {
		path: "/",
		httpOnly: true,
		// secure: true,
		sameSite: "strict",
		maxAge: 60 * 60,
	});
	reply.status(201).send({ success: true });
}

export async function signOutHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	reply.clearCookie("access_token", { path: "/" });
	return reply.status(200).send({ success: true });
}

export async function verifyJWTHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	reply.status(200).send({ success: true });
}

export async function refreshJWTHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const payload = request.user;
	const accessToken = await reply.jwtSign(payload, {expiresIn: "1h"});
	reply.setCookie("access_token", accessToken, {
		path: "/",
		httpOnly: true,
		// secure: true,
		sameSite: "strict",
		maxAge: 60 * 60,
	});
	reply.status(200).send({ success: true });
}

export async function healthCheckHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	reply.status(200).send({ success: true });
}
