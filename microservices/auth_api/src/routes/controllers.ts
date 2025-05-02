import type { FastifyReply, FastifyRequest } from "fastify";
import type { SignInInput } from "./zodSchemas";
import {
	signIn,
} from "./service";

export async function signInHandler(
	request: FastifyRequest<{ Body: SignInInput }>,
	reply: FastifyReply,
) {
	const { email, password } = request.body;
	const checkCredentials = await signIn(email, password);
	if (!checkCredentials) {
		return reply.status(401).send({ success: false });
	}
	const payload = {
		// id: 5,
		email: email,
	}
	const accessToken = await reply.jwtSign(payload, {expiresIn: "1h"});
	reply.setCookie("access_token", accessToken, {
		path: "/",
		httpOnly: true,
		// secure: true,
		sameSite: "strict",
		maxAge: 60 * 60,
	});
	reply.status(200).send({ success: accessToken });
}

export async function signOutHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	reply.clearCookie("access_token", { path: "/" });
	return reply.status(200).send({ success: true });
}

export async function healthCheckHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	reply.status(200).send({ success: true });
}
