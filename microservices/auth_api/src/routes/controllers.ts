import type { FastifyReply, FastifyRequest } from "fastify";
import {
	signInRequest,
	signUpRequest,
	getUserRequest,
	editProfileRequest,
	updateProfileRequest,
	deleteUserRequest,
} from "./httpRequests";
import { setCookieOpt, jwtSignOpt, clearCookieOpt } from "./configs";
import { env } from "../utils/env";
import * as cookieSignature from "cookie-signature";
import { cookieSecret } from "../utils/options";
import { payloadZodSchema } from "./zodSchemas";
import type { IdInput, PayloadInput } from "./zodSchemas";

export async function signInHandler(
	request: FastifyRequest<{ Body: unknown }>,
	reply: FastifyReply,
) {
	const response = await signInRequest(request.body);
	const data = await response.json();
	if (!response.ok) {
		reply.log.warn(
			{ Response: data, Body: request.body },
			"signInRequest() response not ok",
		);
		return reply.status(data.statusCode || 500).send(data);
	}
	const payload = payloadZodSchema.parse(data);
	const accessToken = await reply.jwtSign(payload, jwtSignOpt);
	reply.setCookie(env.JWT_TOKEN_NAME, accessToken, setCookieOpt);
	reply.status(200).send(data);
}

export async function signUpHandler(
	request: FastifyRequest<{ Body: unknown }>,
	reply: FastifyReply,
) {
	const response = await signUpRequest(request.body);
	const data = await response.json();
	if (!response.ok) {
		reply.log.warn(
			{ Response: data, Body: request.body },
			"signUpRequest() response not ok",
		);
		return reply.status(data.statusCode || 500).send(data);
	}
	const payload = payloadZodSchema.parse(data);
	const accessToken = await reply.jwtSign(payload, jwtSignOpt);
	reply.setCookie(env.JWT_TOKEN_NAME, accessToken, setCookieOpt);
	reply.status(200).send(data);
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
	const rawAccessToken = await reply.jwtSign(payload, jwtSignOpt);
	const accessToken = cookieSignature.sign(rawAccessToken, cookieSecret);
	reply.status(200).send({ [env.JWT_TOKEN_NAME]: accessToken });
}

export async function updateJWTHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const response = await getUserRequest(request.user.id);
	const data = await response.json();
	if (!response.ok) {
		reply.log.warn(
			{ Response: data, User: request.user },
			"getUserRequest() response not ok",
		);
		return reply.status(data.statusCode || 500).send(data);
	}
	const payload = payloadZodSchema.parse(data);
	const accessToken = await reply.jwtSign(payload, jwtSignOpt);
	reply.setCookie(env.JWT_TOKEN_NAME, accessToken, setCookieOpt);
	reply.status(200).send(data);
}

export async function updateJWTPatchHandler(
	request: FastifyRequest<{ Body: PayloadInput }>,
	reply: FastifyReply,
) {
	const payload = payloadZodSchema.parse(request.body);
	const accessToken = await reply.jwtSign(payload, jwtSignOpt);
	reply.setCookie(env.JWT_TOKEN_NAME, accessToken, setCookieOpt);
	reply.status(200).send(payload);
}

export async function editProfileHandler(
	request: FastifyRequest<{ Body: unknown; Params: IdInput }>,
	reply: FastifyReply,
) {
	const response = await editProfileRequest(request.body, request.params.id);
	const data = await response.json();
	if (!response.ok) {
		reply.log.warn(
			{ Response: data, Body: request.body, Params: request.params },
			"editProfileRequest() response not ok",
		);
		return reply.status(data.statusCode || 500).send(data);
	}
	const payload = payloadZodSchema.parse(data);
	const accessToken = await reply.jwtSign(payload, jwtSignOpt);
	reply.setCookie(env.JWT_TOKEN_NAME, accessToken, setCookieOpt);
	reply.status(200).send(data);
}

export async function updateProfileHandler(
	request: FastifyRequest<{ Body: unknown; Params: IdInput }>,
	reply: FastifyReply,
) {
	const response = await updateProfileRequest(
		request.body,
		request.params.id,
	);
	const data = await response.json();
	if (!response.ok) {
		reply.log.warn(
			{ Response: data, Body: request.body, Params: request.params },
			"updateProfileRequest() response not ok",
		);
		return reply.status(data.statusCode || 500).send(data);
	}
	const payload = payloadZodSchema.parse(data);
	const accessToken = await reply.jwtSign(payload, jwtSignOpt);
	reply.setCookie(env.JWT_TOKEN_NAME, accessToken, setCookieOpt);
	reply.status(200).send(data);
}

export async function deleteUserHandler(
	request: FastifyRequest<{ Params: IdInput }>,
	reply: FastifyReply,
) {
	const response = await deleteUserRequest(request.params.id);
	if (!response.ok) {
		const data = await response.json();
		reply.log.warn(
			{ Response: data, Params: request.params },
			"deleteUserRequest() response not ok",
		);
		return reply.status(data.statusCode || 500).send(data);
	}
	reply.clearCookie(env.JWT_TOKEN_NAME, clearCookieOpt);
	reply.status(200).send();
}

export async function healthCheckHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	reply.status(200).send();
}
