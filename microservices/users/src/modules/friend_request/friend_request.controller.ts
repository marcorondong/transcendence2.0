import { FastifyRequest, FastifyReply } from "fastify";
import {
	sendFriendRequest,
	getFriendRequests,
	acceptFriendRequest,
	deleteFriendRequest,
} from "./friend_request.service";
import {
	SendFriendRequestInput,
	friendRequestResponseSchema,
	friendRequestArrayResponseSchema,
} from "./friend_request.schema";

export async function sendFriendRequestHandler(
	request: FastifyRequest<{ Body: SendFriendRequestInput }>,
	reply: FastifyReply,
) {
	const { fromId, toId, message } = request.body;
	const result = await sendFriendRequest(fromId, toId, message);

	// If it was auto-accepted, return a 201 with a flag
	if ("autoAccepted" in result) {
		return reply.code(201).send({ autoAccepted: true });
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
	await acceptFriendRequest(id);
	return reply.code(200).send({}); // For following REST habit / convention
}

export async function deleteFriendRequestHandler(
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply,
) {
	const { id } = request.params;
	await deleteFriendRequest(id);
	return reply.code(204).send(); // TODO Return `{}` too as acceptFriendRequestHandler?
}
