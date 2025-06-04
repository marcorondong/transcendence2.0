import type { FastifyReply, FastifyRequest } from "fastify";
import {
	signInRequest,
	signUpRequest,
	// editProfileRequest, // AUTH will only handle cookies/jwt management it should intercept calls
	// updateProfileRequest, // AUTH will only handle cookies/jwt management it should intercept calls
	// deleteUserRequest, // AUTH will only handle cookies/jwt management it should intercept calls
} from "./httpRequests";
import { setCookieOpt, jwtSignOpt, clearCookieOpt } from "./configs";
import { env } from "../utils/env";
import * as cookieSignature from "cookie-signature";
import { cookieSecret } from "../utils/options";

export async function signInHandler(
	request: FastifyRequest<{ Body: unknown }>,
	reply: FastifyReply,
) {
	const payload = await signInRequest(request.body);
	const accessToken = await reply.jwtSign(payload, jwtSignOpt);
	reply.setCookie(env.JWT_TOKEN_NAME, accessToken, setCookieOpt);
	reply.status(200).send();
}

export async function signUpHandler(
	request: FastifyRequest<{ Body: unknown }>,
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
	reply.status(200).send();
}

export async function verifyJWTHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	reply.status(200).send();
}

export async function refreshJWTHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const payload = { id: request.user.id, nickname: request.user.nickname };
	const accessToken = await reply.jwtSign(payload, jwtSignOpt);
	reply.setCookie(env.JWT_TOKEN_NAME, accessToken, setCookieOpt);
	reply.status(200).send();
}

export async function verifyConnectionHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { id, nickname } = request.user;
	reply.status(200).send({ id, nickname });
}

export async function botJWTHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const payload = { id: env.BOT_UUID, nickname: env.BOT_NICKNAME };
	const raw_access_token = await reply.jwtSign(payload, jwtSignOpt);
	console.log("raw_access_token", raw_access_token);
	const access_token = cookieSignature.sign(raw_access_token, cookieSecret);
	console.log("access_token", access_token);
	reply.status(200).send({ [env.JWT_TOKEN_NAME]: access_token });
}

// TODO: This won't be handled by AUTH. And will have major refactoring to limit scope (only handling cookies/jwt)
// export async function editProfileHandler(
// 	request: FastifyRequest<{ Body: unknown; Params: { id: string } }>,
// 	reply: FastifyReply,
// ) {
// 	const { id } = request.params;
// 	const payload = await editProfileRequest(request.body, id);
// 	const accessToken = await reply.jwtSign(payload, jwtSignOpt);
// 	reply.setCookie(env.JWT_TOKEN_NAME, accessToken, setCookieOpt);
// 	reply.status(200).send();
// }

// TODO: This won't be handled by AUTH. And will have major refactoring to limit scope (only handling cookies/jwt)
// export async function updateProfileHandler(
// 	request: FastifyRequest<{ Body: unknown; Params: { id: string } }>,
// 	reply: FastifyReply,
// ) {
// 	const { id } = request.params;
// 	const payload = await updateProfileRequest(request.body, id);
// 	const accessToken = await reply.jwtSign(payload, jwtSignOpt);
// 	reply.setCookie(env.JWT_TOKEN_NAME, accessToken, setCookieOpt);
// 	reply.status(200).send();
// }

// TODO: This won't be handled by AUTH. And will have major refactoring to limit scope (only handling cookies/jwt)
// export async function deleteUserHandler(
// 	request: FastifyRequest<{ Params: unknown }>,
// 	reply: FastifyReply,
// ) {
// 	const { id } = request.params as { id: string };
// 	await deleteUserRequest(id);
// 	reply.clearCookie(env.JWT_TOKEN_NAME, clearCookieOpt);
// 	reply.status(200).send();
// }

export async function healthCheckHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	reply.status(200).send();
}
