import type { FastifyReply, FastifyRequest } from "fastify";
import {
	signInRequest,
	signUpRequest,
	editProfileRequest,
	updateProfileRequest,
	deleteUserRequest,
} from "./httpRequests";
import { setCookieOpt, jwtSignOpt, clearCookieOpt } from "./configs";
import { env } from "../utils/env";
import * as cookieSignature from "cookie-signature";
import { cookieSecret } from "../utils/options";
import { payloadZodSchema } from "./zodSchemas";
import type { IdInput } from "./zodSchemas";

export async function signInHandler(
	request: FastifyRequest<{ Body: unknown }>,
	reply: FastifyReply,
) {
	const payload = await signInRequest(request.body, reply);
	if (!payload) return;
	const accessToken = await reply.jwtSign(payload, jwtSignOpt);
	reply.setCookie(env.JWT_TOKEN_NAME, accessToken, setCookieOpt);
	reply.status(200).send(payload);
}

export async function signUpHandler(
	request: FastifyRequest<{ Body: unknown }>,
	reply: FastifyReply,
) {
	const payload = await signUpRequest(request.body, reply);
	if (!payload) return;
	const accessToken = await reply.jwtSign(payload, jwtSignOpt);
	reply.setCookie(env.JWT_TOKEN_NAME, accessToken, setCookieOpt);
	reply.status(200).send(payload);
}

export async function signOutHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	reply.clearCookie(env.JWT_TOKEN_NAME, clearCookieOpt);
	reply.status(200).send();
}

export async function verifyJWTHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const payload = payloadZodSchema.parse(request.user);
	reply.status(200).send(payload);
}

export async function refreshJWTHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const payload = payloadZodSchema.parse(request.user);
	const accessToken = await reply.jwtSign(payload, jwtSignOpt);
	reply.setCookie(env.JWT_TOKEN_NAME, accessToken, setCookieOpt);
	reply.status(200).send(payload);
}

export async function verifyConnectionHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const payload = payloadZodSchema.parse(request.user);
	reply.status(200).send(payload);
}

export async function botJWTHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const payload = { id: env.BOT_UUID, nickname: env.BOT_NICKNAME };
	const raw_access_token = await reply.jwtSign(payload, jwtSignOpt);
	const access_token = cookieSignature.sign(raw_access_token, cookieSecret);
	reply.status(200).send({ [env.JWT_TOKEN_NAME]: access_token });
}

export async function editProfileHandler(
	request: FastifyRequest<{ Body: unknown; Params: IdInput }>,
	reply: FastifyReply,
) {
	const payload = await editProfileRequest(
		request.body,
		request.params,
		reply,
	);
	if (!payload) return;
	const accessToken = await reply.jwtSign(payload, jwtSignOpt);
	reply.setCookie(env.JWT_TOKEN_NAME, accessToken, setCookieOpt);
	reply.status(200).send();
}

export async function updateProfileHandler(
	request: FastifyRequest<{ Body: unknown; Params: IdInput }>,
	reply: FastifyReply,
) {
	const payload = await updateProfileRequest(
		request.body,
		request.params,
		reply,
	);
	if (!payload) return;
	const accessToken = await reply.jwtSign(payload, jwtSignOpt);
	reply.setCookie(env.JWT_TOKEN_NAME, accessToken, setCookieOpt);
	reply.status(200).send();
}

export async function deleteUserHandler(
	request: FastifyRequest<{ Params: IdInput }>,
	reply: FastifyReply,
) {
	const result = await deleteUserRequest(request.params, reply);
	if (!result) return;
	reply.clearCookie(env.JWT_TOKEN_NAME, clearCookieOpt);
	reply.status(200).send();
}

export async function healthCheckHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	reply.status(200).send();
}
