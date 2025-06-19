import { Prisma } from "@prisma/client";
import { AppError, FRIEND_REQUEST_ERRORS } from "../../utils/errors";
import {
	getUserOrThrow,
	addFriend,
	areAlreadyFriends,
} from "../user/user.service";
import prisma from "../../utils/prisma";

const AUTO_ACCEPT_REVERSE_REQUESTS = true;

// Helper function to accept reversed friend request (if UserB already sent request to UserA)
async function resolveFriendRequest(
	fromId: string,
	toId: string,
	requestId: string,
) {
	try {
		await addFriend(fromId, toId); // Create friendship using addFriend from user module
		await prisma.friendRequest.delete({ where: { id: requestId } }); // Delete friend request once friendship added
		// Get and return the users objects involved in the friendship
		return Promise.all([
			getUserOrThrow({ id: fromId }),
			getUserOrThrow({ id: toId }),
		]);
	} catch (err) {
		// Known/Expected errors bubble up to controller as AppError (custom error)
		if (err instanceof AppError) throw err;
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}

export async function createFriendRequest(
	fromId: string,
	toId: string,
	message: string,
) {
	try {
		if (fromId === toId) {
			throw new AppError({
				statusCode: 400,
				code: FRIEND_REQUEST_ERRORS.SELF,
				message: "Cannot create a friend request to yourself",
			});
		}
		// Ensure users exist
		await Promise.all([
			getUserOrThrow({ id: fromId }),
			getUserOrThrow({ id: toId }),
		]);
		// Already friends?
		if (await areAlreadyFriends(fromId, toId)) {
			throw new AppError({
				statusCode: 409,
				code: FRIEND_REQUEST_ERRORS.ALREADY,
				message: "Users are already friends",
			});
		}
		// Reverse request already exists? (fromId: toId, and toId: fromId)
		const reverseRequest = await prisma.friendRequest.findFirst({
			where: { fromId: toId, toId: fromId },
		});
		if (reverseRequest) {
			if (AUTO_ACCEPT_REVERSE_REQUESTS) {
				// Return the users objects involved in the friendship
				return await resolveFriendRequest(
					fromId,
					toId,
					reverseRequest.id,
				);
			} else {
				throw new AppError({
					statusCode: 409,
					code: FRIEND_REQUEST_ERRORS.CREATE,
					message:
						"A friend request from this user is already pending. Accept it instead.",
				});
			}
		}
		// Duplicate same-direction request?
		// Note that I'm already enforcing @@unique, but apparently this is best practice
		// Avoids DB errors as flow control and I'm  "avoiding failure" instead of "handling it"
		const existing = await prisma.friendRequest.findFirst({
			where: { fromId, toId },
		});
		if (existing) {
			throw new AppError({
				statusCode: 409,
				code: FRIEND_REQUEST_ERRORS.CREATE,
				message: "Friend request already sent",
			});
		}
		// Create the friend request (include both user objects. Not just their ids)
		return await prisma.friendRequest.create({
			data: { fromId, toId, message },
			include: {
				from: true,
				to: true,
			},
		});
	} catch (err) {
		// Known/Expected errors bubble up to controller as AppError (custom error)
		if (err instanceof AppError) throw err;
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}

export async function getFriendRequests() {
	try {
		const friendRequests = await prisma.friendRequest.findMany({
			include: {
				from: true,
				to: true,
			},
		});
		// This is not-standard, but it's easier to check by the status code
		if (!friendRequests.length) {
			throw new AppError({
				statusCode: 404,
				code: FRIEND_REQUEST_ERRORS.NOT_FOUND,
				message: "No friend requests found",
			});
		}
		return friendRequests;
	} catch (err) {
		// Known/Expected errors bubble up to controller as AppError (custom error)
		if (err instanceof Prisma.PrismaClientValidationError) {
			throw new AppError({
				statusCode: 400,
				code: FRIEND_REQUEST_ERRORS.INVALID_QUERY,
				message: "Could not retrieve friend requests",
			});
		}
		if (err instanceof AppError) throw err;
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}

export async function acceptFriendRequest(id: string) {
	try {
		const friendRequest = await prisma.friendRequest.findUnique({
			where: { id },
		});
		if (!friendRequest) {
			throw new AppError({
				statusCode: 404,
				code: FRIEND_REQUEST_ERRORS.NOT_FOUND,
				message: "Friend request not found",
			});
		}
		// Return the users objects involved in the friendship
		return await resolveFriendRequest(
			friendRequest.fromId,
			friendRequest.toId,
			id,
		);
	} catch (err) {
		// Known/Expected errors bubble up to controller as AppError (custom error)
		if (err instanceof AppError) throw err;
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}

export async function deleteFriendRequest(id: string): Promise<void> {
	try {
		await prisma.friendRequest.delete({ where: { id } });
	} catch (err) {
		// Known/Expected errors bubble up to controller as AppError (custom error)
		if (
			err instanceof Prisma.PrismaClientKnownRequestError &&
			err.code === "P2025"
		) {
			throw new AppError({
				statusCode: 404,
				code: FRIEND_REQUEST_ERRORS.NOT_FOUND,
				message: "Friend request not found",
			});
		}
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}
