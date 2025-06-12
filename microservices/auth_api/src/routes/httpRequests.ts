import type { FastifyReply } from "fastify";
import { env } from "../utils/env";
import { payloadZodSchema } from "./zodSchemas";

export async function signInRequest(body: unknown, reply: FastifyReply) {
	const response = await fetch(env.USERS_LOGIN_REQUEST_DOCKER, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});
	if (!response.ok) {
		const raw = await response.json();
		reply.status(raw.statusCode || 500).send(raw);
		return false;
	}
	const data = await response.json();
	const payload = payloadZodSchema.parse(data);
	return payload;
}

export async function signUpRequest(body: unknown, reply: FastifyReply) {
	const response = await fetch(env.USERS_REGISTRATION_REQUEST_DOCKER, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});
	if (!response.ok) {
		const raw = await response.json();
		reply.status(raw.statusCode || 500).send(raw);
		return false;
	}
	const data = await response.json();
	const payload = payloadZodSchema.parse(data);
	return payload;
}

export async function editProfileRequest(body: unknown, userId: unknown, reply: FastifyReply) {
	const response = await fetch(`${env.USERS_REQUEST_DOCKER}${userId}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});
	if (!response.ok) {
		const raw = await response.json();
		reply.status(raw.statusCode || 500).send(raw);
		return false;
	}
	const data = await response.json();
	const payload = { id: data.id, nickname: data.nickname };
	return payload;
}

export async function updateProfileRequest(body: unknown, userId: unknown, reply: FastifyReply) {
	const response = await fetch(`${env.USERS_REQUEST_DOCKER}${userId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});
	if (!response.ok) {
		const raw = await response.json();
		reply.status(raw.statusCode || 500).send(raw);
		return false;
	}
	const data = await response.json();
	const payload = { id: data.id, nickname: data.nickname };
	return payload;
}

export async function deleteUserRequest(userId: unknown, reply: FastifyReply) {
	const response = await fetch(`${env.USERS_REQUEST_DOCKER}${userId}`, {
		method: "DELETE",
	});
	if (!response.ok) {
		const raw = await response.json();
		reply.status(raw.statusCode || 500).send(raw);
		return false;
	}
	return true;
}
