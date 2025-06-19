import { FastifyRequest, FastifyReply } from "fastify";
import {
	createFriendRequest,
	getFriendRequests,
	acceptFriendRequest,
	deleteFriendRequest,
} from "./friend_request.service";
import {
	CreateFriendRequestInput,
	friendRequestResponseSchema,
	friendRequestArrayResponseSchema,
} from "./friend_request.schema";
import { userArrayResponseSchema } from "../user/user.schema";

export async function createFriendRequestHandler(
	request: FastifyRequest<{ Body: CreateFriendRequestInput }>,
	reply: FastifyReply,
) {
	const { fromId, toId, message } = request.body;
	const result = await createFriendRequest(fromId, toId, message);

	// If it was auto-accepted,
	if (Array.isArray(result)) {
		// Reverse request was auto-accepted; return befriended users (200 OK, instead of 201 friend request created)
		const parsed = userArrayResponseSchema.parse(result);
		return reply.code(200).send(parsed);
	}
	// Otherwise return the created friend request
	const parsed = friendRequestResponseSchema.parse(result);
	return reply.code(201).send(parsed);
}

export async function getFriendRequestsHandler(
	_: FastifyRequest,
	reply: FastifyReply,
) {
	const requests = await getFriendRequests();
	const parsed = friendRequestArrayResponseSchema.parse(requests);
	return reply.code(200).send(parsed);
}

export async function acceptFriendRequestHandler(
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply,
) {
	const { id } = request.params;
	const users = await acceptFriendRequest(id);
	const parsed = userArrayResponseSchema.parse(users);
	return reply.code(200).send(parsed);
}

export async function deleteFriendRequestHandler(
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply,
) {
	const { id } = request.params;
	await deleteFriendRequest(id);
	return reply.code(204).send();
}
