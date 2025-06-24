import { Prisma } from "@prisma/client";
import { AppError, FRIEND_REQUEST_ERRORS } from "../../utils/errors";
import { logger } from "../../utils/logger";
import prisma from "../../utils/prisma";
import {
	getUserOrThrow,
	addFriend,
	areAlreadyFriends,
} from "../user/user.service";
import {
	UniqueFriendRequestField,
	FriendRequestQueryField,
	FriendRequestField,
	SortDirection,
} from "./friend_request.schema";

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

// Helper function to retrieve a friend request from the database
export async function getFriendRequestOrThrow(where: UniqueFriendRequestField) {
	// const friendRequest = await prisma.friendRequest.findUnique({ where });
	const friendRequest = await prisma.friendRequest.findUnique({
		where,
		include: {
			from: true,
			to: true,
		},
	});

	if (!friendRequest) {
		throw new AppError({
			statusCode: 404,
			code: FRIEND_REQUEST_ERRORS.NOT_FOUND,
			// message: "FriendRequest not found",
			message: `FriendRequest not found: ${JSON.stringify(where)}`,
		});
	}

	return friendRequest;
}

// This function returns all friend request fields (no filtering). It only accepts unique fields, so it returns ONLY ONE friend request
export async function findFriendRequestByUnique(
	where: UniqueFriendRequestField,
) {
	try {
		return await getFriendRequestOrThrow(where);
	} catch (err) {
		if (err instanceof AppError) {
			// Known/Expected errors bubble up to controller as AppError (custom error)
			throw err;
		}
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}

// Type definition for query options
type FriendRequestQueryOptions = {
	// where?: Partial<Record<FriendRequestField, string | Date>>; // To filter by FriendRequestQueryField
	where?: FriendRequestQueryField;
	filterIds?: string[]; // To filter by array of IDs
	useFuzzy?: boolean; // To allow partial matches
	useOr?: boolean; // To allow OR logic
	before?: Date;
	after?: Date;
	between?: [Date, Date];
	skip?: number; // To skip the first n entries
	take?: number; // To limit the number of returned entries
	sortBy?: FriendRequestField; // To sort by id
	order?: SortDirection; // to order asc/desc
};

// TODO: MR: Check if I can avoid using keyword `any`
// Function for searching users. It supports OR (`useOr`) and fuzzy search (`contains`)
export async function findFriendRequests(
	options: FriendRequestQueryOptions = {},
) {
	// Remove undefined fields from the full options object
	const cleanedOptions = Object.fromEntries(
		Object.entries(options).filter(([_, v]) => v !== undefined),
	) as FriendRequestQueryOptions;

	const {
		where = {},
		filterIds,
		useFuzzy = false,
		useOr = false,
		before,
		after,
		between,
		skip,
		take,
		sortBy = "createdAt",
		order = "asc",
	} = cleanedOptions;

	logger.debug({
		"event.action": "findFriendRequests",
		"cleanedOptions": cleanedOptions,
		"message": "✅ Step 1: Received Cleaned Options",
	});
	try {
		// Remove undefined fields from 'where'
		const cleanedWhere = Object.fromEntries(
			Object.entries(where).filter(([_, v]) => v !== undefined),
		);
		const transformed = Object.entries(cleanedWhere).reduce(
			(acc, [key, value]) => {
				// Enable fuzzy search (transform string fields to `contains` filters)
				if (
					typeof value === "string" &&
					useFuzzy &&
					key === "message"
				) {
					acc[key] = { contains: value };
				} else {
					acc[key] = value;
				}
				return acc;
			},
			{} as Record<string, any>,
		);
		// Helper function to apply date filters
		const applyDateFilter = (field: "createdAt") => {
			if (before) {
				transformed[field] = {
					...(transformed[field] ?? {}),
					lt: before,
				};
			}
			if (after) {
				transformed[field] = {
					...(transformed[field] ?? {}),
					gte: after,
				};
			}
			// if (Array.isArray(between) && between.length === 2) {
			if (between) {
				const [start, end] = between;
				transformed[field] = {
					...(transformed[field] ?? {}),
					gte: start,
					lte: end,
				};
			}
		};

		// Apply date filters
		applyDateFilter("createdAt");
		// Merge 'filterIds' and 'where.id' into a unified filter
		const combinedIds = new Set<string>();
		if (filterIds?.length) filterIds.forEach((id) => combinedIds.add(id));
		if (where.id) combinedIds.add(where.id as string);

		let query: Record<string, any>;

		logger.debug({
			"event.action": "getFriendRequests",
			"transformed": transformed,
			"message": "✅ Step 2: Transformed 'where'",
		});
		// Enable OR queries (map provided fields to build individual queries)
		if (useOr) {
			const orConditions = Object.entries(transformed).map(([k, v]) => ({
				[k]: v,
			}));
			if (combinedIds.size > 0) {
				orConditions.push({ id: { in: Array.from(combinedIds) } });
			}
			query = orConditions.length > 0 ? { OR: orConditions } : {};
		} else {
			query = { ...transformed };
			if (combinedIds.size > 0) {
				query.id = { in: Array.from(combinedIds) };
			}
		}

		logger.debug({
			"event.action": "findFriendRequests",
			"query": query,
			"message": "✅ Step 3: Final Query Shape",
		});
		const prismaSortBy = { [sortBy]: order };

		logger.debug({
			"event.action": "findFriendRequests",
			"where": query,
			"orderBy": prismaSortBy,
			"skip": skip,
			"take": take,
			"message": "✅ Step 4: Final Prisma Query",
		});
		const friendRequests = await prisma.friendRequest.findMany({
			where: query,
			include: {
				from: true,
				to: true,
			},
			orderBy: prismaSortBy,
			skip,
			take,
		});
		logger.debug({
			"event.action": "findFriendRequests",
			"users": friendRequests,
			"message": "✅ Step 5: Result",
		});
		// This is not-standard, but it's easier to check by the status code
		if (!friendRequests.length) {
			// throw new AppError({
			// 	statusCode: 404,
			// 	code: FRIEND_REQUEST_ERRORS.NOT_FOUND,
			// 	message: "No friend requests found",
			// });
			logger.debug(
				{
					"event.action": "findFriendRequests",
					"where": query,
					"skip": skip,
					"take": take,
				},
				"No friend request found that matches this criteria",
			);
			return friendRequests;
		}

		return friendRequests;
	} catch (err) {
		logger.error({
			"event.action": "findFriendRequests",
			"error": err,
			"message": "❌ Step 6: Error Caught",
		});
		// Known/Expected errors bubble up to controller as AppError (custom error)
		if (err instanceof Prisma.PrismaClientValidationError) {
			throw new AppError({
				statusCode: 400,
				code: FRIEND_REQUEST_ERRORS.INVALID_SORT,
				message: `Invalid sortBy field: ${sortBy}`,
			});
		}
		if (err instanceof AppError) throw err;
		logger.error({
			"event.action": "findFriendRequests",
			"error": err,
			"message": "❌ Step 6.2: Unknown error",
		});
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
