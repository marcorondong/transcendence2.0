import { Prisma } from "@prisma/client";
import {
	AppError,
	BLOCK_LIST_ERRORS,
	FRIENDSHIP_ERRORS,
	USER_ERRORS,
} from "../../utils/errors";
import { hashPassword } from "../../utils/hash";
import prisma from "../../utils/prisma";
import {
	createUserInput,
	UpdateUserData,
	UniqueUserField,
	UserQueryOptions,
} from "./user.schema";
import { logger } from "../../utils/logger";

// Helper function to capitalize conflicting Prisma field
function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

// Helper function to check password constraints (no email/username/nickname)
function checkPasswordConstraints(
	password: string,
	userData: { email?: string; username?: string; nickname?: string },
) {
	const lowerPassword = password.toLowerCase();
	if (
		userData.username &&
		lowerPassword.includes(userData.username.toLowerCase())
	) {
		// throw new Error("Password cannot contain the username");
		throw new AppError({
			statusCode: 400,
			code: USER_ERRORS.CONSTRAINTS,
			message: "Password cannot contain the username",
		});
	}
	if (
		userData.nickname &&
		lowerPassword.includes(userData.nickname.toLowerCase())
	) {
		// throw new Error("Password cannot contain the nickname");
		throw new AppError({
			statusCode: 400,
			code: USER_ERRORS.CONSTRAINTS,
			message: "Password cannot contain the nickname",
		});
	}
	if (userData.email && lowerPassword === userData.email.toLowerCase()) {
		// throw new Error("Password cannot be same as the email");
		throw new AppError({
			statusCode: 400,
			code: USER_ERRORS.CONSTRAINTS,
			message: "Password cannot be same as the email",
		});
	}
}

export async function createUser(input: createUserInput) {
	const { password, ...rest } = input;
	try {
		checkPasswordConstraints(password, {
			email: rest.email,
			username: rest.username,
			nickname: rest.nickname,
		});
	} catch (err) {
		// Known/Expected errors bubble up to controller as AppError (custom error)
		throw new AppError({
			statusCode: 400,
			code: USER_ERRORS.CREATE,
			message: (err as Error).message,
		});
	}
	const { salt, hash } = hashPassword(password);
	try {
		const user = await prisma.user.create({
			data: { ...rest, salt, passwordHash: hash },
		});
		return user;
	} catch (err) {
		if (err instanceof Prisma.PrismaClientKnownRequestError) {
			// Known/Expected errors bubble up to controller as AppError (custom error)
			switch (err.code) {
				case "P2002":
					const target =
						(err.meta?.target as string[])?.[0] ?? "field";
					throw new AppError({
						statusCode: 409,
						code: USER_ERRORS.CREATE,
						message: `${capitalize(target)} already exists`,
					});
				case "P2003":
					throw new AppError({
						statusCode: 400,
						code: USER_ERRORS.CREATE,
						message: "Invalid foreign key",
					});
			}
		}
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}

// Helper function to retrieve a user from the database
export async function getUserOrThrow(where: UniqueUserField) {
	const user = await prisma.user.findUnique({ where });

	if (!user) {
		throw new AppError({
			statusCode: 404,
			code: USER_ERRORS.NOT_FOUND,
			// message: "User not found",
			message: `User not found: ${JSON.stringify(where)}`,
		});
	}

	return user;
}

// This function returns all user fields (no filtering). It only accepts unique fields, so it returns ONLY ONE user
export async function findUserByUnique(where: UniqueUserField) {
	try {
		return await getUserOrThrow(where);
	} catch (err) {
		if (err instanceof AppError) {
			// Known/Expected errors bubble up to controller as AppError (custom error)
			throw err;
		}
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}

// Function for searching users. It supports OR (`useOr`) and fuzzy search (`contains`)
export async function findUsers(options: UserQueryOptions = {}) {
	// Remove undefined fields from the full options object
	const cleanedOptions = Object.fromEntries(
		Object.entries(options).filter(([_, v]) => v !== undefined),
	) as UserQueryOptions;

	const {
		where = {},
		filterIds,
		useFuzzy = false,
		useOr = false,
		dateTarget = "createdAt",
		before,
		after,
		between,
		skip,
		take,
		sortBy = "createdAt",
		order = "asc",
	} = cleanedOptions;

	logger.debug({
		"event.action": "findUsers",
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
				if (typeof value === "string" && useFuzzy) {
					acc[key] = { contains: value };
				} else {
					acc[key] = value;
				}
				return acc;
			},
			{} as Record<string, any>,
		);
		// Helper function to apply date filters
		const applyDateFilter = (field: "createdAt" | "updatedAt") => {
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
		if (dateTarget === "both") {
			applyDateFilter("createdAt");
			applyDateFilter("updatedAt");
		} else {
			//applyDateFilter(dateTarget ?? "createdAt");
			applyDateFilter(dateTarget);
		}
		// Merge 'filterIds' and 'where.id' into a unified filter
		const combinedIds = new Set<string>();
		if (filterIds?.length) {
			filterIds.forEach((id) => combinedIds.add(id));
		}
		if (where.id) {
			combinedIds.add(where.id as string);
		}

		let query: Record<string, any>;

		logger.debug({
			"event.action": "findUsers",
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
			"event.action": "findUsers",
			"query": query,
			"message": "✅ Step 3: Final Query Shape",
		});
		const prismaSortBy = { [sortBy]: order };

		logger.debug({
			"event.action": "findUsers",
			"where": query,
			"orderBy": prismaSortBy,
			"skip": skip,
			"take": take,
			"message": "✅ Step 4: Final Prisma Query",
		});
		const users = await prisma.user.findMany({
			where: query,
			orderBy: prismaSortBy,
			skip,
			take,
		});
		logger.debug({
			"event.action": "findUsers",
			"users": users,
			"message": "✅ Step 5: Result",
		});
		// This is not-standard, but it's easier to check by the status code
		if (!users.length) {
			// throw new AppError({
			// 	statusCode: 404,
			// 	code: USER_ERRORS.NOT_FOUND,
			// 	message: "No users found",
			// });
			logger.debug(
				{
					"event.action": "findUsers",
					"where": query,
					"skip": skip,
					"take": take,
				},
				"No users found that matches this criteria",
			);
			return users;
		}
		return users;
	} catch (err) {
		logger.error({
			"event.action": "findUsers",
			"error": err,
			"message": "❌ Step 6: Error Caught",
		});
		// Known/Expected errors bubble up to controller as AppError (custom error)
		if (err instanceof Prisma.PrismaClientValidationError) {
			throw new AppError({
				statusCode: 400,
				code: USER_ERRORS.INVALID_SORT,
				message: `Invalid sortBy field: ${sortBy}`,
			});
		}
		if (err instanceof AppError) throw err;
		logger.error({
			"event.action": "findUsers",
			"error": err,
			"message": "❌ Step 6.2: Unknown error",
		});
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}

export async function deleteUser(id: string): Promise<void> {
	try {
		await prisma.user.delete({ where: { id } });
		// Service handles database operations; so other logic like file cleanup is handled in controller
	} catch (err) {
		// Known/Expected errors bubble up to controller as AppError (custom error)
		if (
			err instanceof Prisma.PrismaClientKnownRequestError &&
			err.code === "P2025"
		) {
			throw new AppError({
				statusCode: 404,
				code: USER_ERRORS.DELETE,
				message: "User not found",
			});
		}
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}

// TODO: Check also when updating username, nickname and email to check password constraints
export async function updateUser(id: string, data: UpdateUserData) {
	try {
		const updatePayload: Record<string, any> = { ...data };
		let currentUser = await getUserOrThrow({ id }); // get user to ensure it exists and work with it
		if (data.password) {
			// Check password constraints
			try {
				checkPasswordConstraints(data.password, {
					email: data.email ?? currentUser.email,
					// username: data.username ?? currentUser.username, // username cannot be updated after creation
					nickname: data.nickname ?? currentUser.nickname,
				});
			} catch (err) {
				throw new AppError({
					statusCode: 400,
					code: USER_ERRORS.UPDATE,
					message: (err as Error).message,
				});
			}
			// Hash password if provided
			const { salt, hash } = hashPassword(data.password);
			updatePayload.passwordHash = hash;
			updatePayload.salt = salt;
			delete updatePayload.password; // remove plain password
		}
		currentUser = await prisma.user.update({
			where: { id },
			data: updatePayload,
		});
		return currentUser;
	} catch (err) {
		// Known/Expected errors bubble up to controller as AppError (custom error)
		if (err instanceof Prisma.PrismaClientKnownRequestError) {
			switch (err.code) {
				case "P2002":
					const field =
						(err.meta?.target as string[])?.[0] ?? "Field";
					throw new AppError({
						statusCode: 409,
						code: USER_ERRORS.UPDATE,
						message: `${capitalize(field)} already exists`,
					});
				case "P2003":
					throw new AppError({
						statusCode: 400,
						code: USER_ERRORS.UPDATE,
						message: "Invalid foreign key",
					});
				case "P2025":
					throw new AppError({
						statusCode: 404,
						code: USER_ERRORS.UPDATE,
						message: "User not found",
					});
			}
		}
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}

// Updates user picture path
export async function updateUserPicture(id: string, picturePath: string) {
	try {
		let currentUser = await getUserOrThrow({ id }); // get user to ensure it exists and work with it
		// Update picture path
		currentUser = await prisma.user.update({
			where: { id },
			data: { picture: picturePath },
		});
		return currentUser;
	} catch (err) {
		// Known/Expected errors bubble up to controller as AppError (custom error)
		if (err instanceof Prisma.PrismaClientKnownRequestError) {
			switch (err.code) {
				case "P2025":
					throw new AppError({
						statusCode: 404,
						code: USER_ERRORS.PICTURE,
						message: "User not found",
					});
			}
		}
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}

// Function for searching user's friends. It supports OR (`useOr`) and fuzzy search (`contains`)
export async function getUserFriends(id: string, query: UserQueryOptions) {
	try {
		await getUserOrThrow({ id }); // Ensure user exists

		// Step 1: Get friendships for the given user
		const friendships = await prisma.friendship.findMany({
			where: {
				OR: [{ user1Id: id }, { user2Id: id }],
			},
			select: {
				user1Id: true,
				user2Id: true,
			},
		});
		const friendIds = friendships.map((f) =>
			f.user1Id === id ? f.user2Id : f.user1Id,
		);
		if (!friendIds.length) {
			// throw new AppError({
			// 	statusCode: 404,
			// 	code: FRIENDSHIP_ERRORS.NOT_FOUND,
			// 	message: "User has no friends",
			// });
			logger.debug(
				{
					"event.action": "getUserFriends",
					"userId": id,
				},
				"User has no friends",
			);
			return [];
		}

		// Step 2: Extract filters from query
		const { where = {}, filterIds: queryFilterIds, ...restQuery } = query;

		const requestedIds = new Set<string>();
		if (typeof where.id === "string") requestedIds.add(where.id);
		if (Array.isArray(queryFilterIds)) {
			queryFilterIds.forEach((id) => requestedIds.add(id));
		}

		// Step 3: Intersect friendIds with requestedIds (if any filters were provided)
		const finalIds =
			requestedIds.size > 0
				? friendIds.filter((fid) => requestedIds.has(fid))
				: friendIds;

		if (!finalIds.length) {
			// throw new AppError({
			// 	statusCode: 404,
			// 	code: FRIENDSHIP_ERRORS.NOT_FOUND,
			// 	message: "No matching friends found",
			// });
			logger.debug(
				{
					"event.action": "getUserFriends",
					"userId": id,
					"where": query,
				},
				"User has no friends that match this criteria",
			);
			return [];
		}

		// Step 4: Remove 'where.id' and pass only intersected filterIds
		const { id: _, ...filteredWhere } = where;

		// Step 5: Use existing logic from findUsers to apply query filters
		return await findUsers({
			...restQuery,
			where: filteredWhere,
			filterIds: finalIds,
		});
	} catch (err) {
		// Known/Expected errors bubble up to controller as AppError (custom error)
		if (err instanceof AppError) throw err;
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}

// TODO: Rename it to `alreadyFriends`
// Helper function for friendRequest module
export async function areAlreadyFriends(
	userId: string,
	targetUserId: string,
): Promise<boolean> {
	if (userId === targetUserId) return false;

	const [user1Id, user2Id] =
		userId < targetUserId ? [userId, targetUserId] : [targetUserId, userId];

	const friendship = await prisma.friendship.findFirst({
		where: { user1Id, user2Id },
		select: { id: true },
	});

	return !!friendship;
}

export async function addFriend(userId: string, targetUserId: string) {
	if (userId === targetUserId) {
		throw new AppError({
			statusCode: 400,
			code: FRIENDSHIP_ERRORS.SELF,
			message: "Cannot add yourself as a friend",
		});
	}
	try {
		// Ensure users exist
		await Promise.all([
			getUserOrThrow({ id: userId }),
			getUserOrThrow({ id: targetUserId }),
		]);
		// Sort users so they are always user1Id < user2Id to avoid A-B and B-A are not stored twice
		const [user1Id, user2Id] =
			userId < targetUserId
				? [userId, targetUserId]
				: [targetUserId, userId];
		// Check if users are already friends
		// Note that I'm already enforcing @@unique, but apparently this is best practice
		// Avoids DB errors as flow control and feels like I'm  "avoiding failure" instead of "handling it"
		if (await areAlreadyFriends(userId, targetUserId)) {
			throw new AppError({
				statusCode: 409,
				code: FRIENDSHIP_ERRORS.ALREADY,
				message: "Users are already friends",
			});
		}

		await prisma.friendship.create({
			data: { user1Id, user2Id },
		});

		// Return the newly added friend user
		return getUserOrThrow({ id: targetUserId });
	} catch (err) {
		// Known/Expected errors bubble up to controller as AppError (custom error)
		if (err instanceof Prisma.PrismaClientKnownRequestError) {
			if (err.code === "P2002") {
				throw new AppError({
					statusCode: 409,
					code: FRIENDSHIP_ERRORS.ADD,
					message: "Users are already friends",
				});
			}
		}
		if (err instanceof AppError) throw err;
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}

export async function deleteFriend(userId: string, targetUserId: string) {
	if (userId === targetUserId) {
		throw new AppError({
			statusCode: 400,
			code: FRIENDSHIP_ERRORS.SELF,
			message: "Cannot delete yourself as a friend",
		});
	}
	try {
		// Ensure users exist
		await Promise.all([
			getUserOrThrow({ id: userId }),
			getUserOrThrow({ id: targetUserId }),
		]);
		// Sort users so they are always user1Id < user2Id to avoid A-B and B-A are not stored twice
		const [user1Id, user2Id] =
			userId < targetUserId
				? [userId, targetUserId]
				: [targetUserId, userId];

		const result = await prisma.friendship.deleteMany({
			where: { user1Id, user2Id },
		});
		// deleteMany doesn't throw is anything is deleted. So I have to check how many rows where deleted
		if (result.count === 0) {
			throw new AppError({
				statusCode: 404,
				code: FRIENDSHIP_ERRORS.DELETE,
				message: "Users were not friends",
			});
		}
	} catch (err) {
		// Known/Expected errors bubble up to controller as AppError (custom error)
		if (err instanceof AppError) throw err;
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}

// Get all users blocked by a specific user
export async function getUserBlocked(id: string, query: UserQueryOptions) {
	try {
		await getUserOrThrow({ id }); // Ensure user exists

		// Step 1: Get friendships for the given user
		const blocked = await prisma.blockList.findMany({
			where: { blockerId: id },
			select: { blockedId: true },
		});
		const blockedIds = blocked.map((entry) => entry.blockedId);

		if (!blockedIds.length) {
			// throw new AppError({
			// 	statusCode: 404,
			// 	code: BLOCK_LIST_ERRORS.NOT_FOUND,
			// 	message: "User has no blocked users",
			// });
			logger.debug(
				{
					"event.action": "getUserBlocked",
					"userId": id,
				},
				"User has no blocked users",
			);
			return [];
		}

		// Step 2: Extract filters from query
		const { where = {}, filterIds: queryFilterIds, ...restQuery } = query;

		const requestedIds = new Set<string>();
		if (typeof where.id === "string") requestedIds.add(where.id);
		if (Array.isArray(queryFilterIds)) {
			queryFilterIds.forEach((id) => requestedIds.add(id));
		}

		// Step 3: Intersect friendIds with requestedIds (if any filters were provided)
		const finalIds =
			requestedIds.size > 0
				? blockedIds.filter((id) => requestedIds.has(id))
				: blockedIds;

		if (!finalIds.length) {
			// throw new AppError({
			// 	statusCode: 404,
			// 	code: BLOCK_LIST_ERRORS.NOT_FOUND,
			// 	message: "No matching blocked users found",
			// });
			logger.debug(
				{
					"event.action": "getUserBlocked",
					"userId": id,
					"where": query,
				},
				"User has no blocked users that match this criteria",
			);
			return [];
		}

		// Step 4: Remove 'where.id' and pass only intersected filterIds
		const { id: _, ...filteredWhere } = where;

		// Step 5: Use existing logic from findUsers to apply query filters
		return await findUsers({
			...restQuery,
			where: filteredWhere,
			filterIds: finalIds,
		});
	} catch (err) {
		// Known/Expected errors bubble up to controller as AppError (custom error)
		if (err instanceof AppError) throw err;
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}

// TODO: Check if I should use `userId` and `targetUserId` as in areAlreadyFriends
// Check if a user is already blocked by another
async function alreadyBlocked(
	blockerId: string,
	blockedId: string,
): Promise<boolean> {
	if (blockerId === blockedId) return false;

	const exists = await prisma.blockList.findFirst({
		where: { blockerId, blockedId },
		select: { id: true },
	});

	return !!exists;
}

// Block a user (unidirectional)
export async function blockUser(userId: string, targetUserId: string) {
	if (userId === targetUserId) {
		throw new AppError({
			statusCode: 400,
			code: BLOCK_LIST_ERRORS.SELF,
			message: "Cannot block yourself",
		});
	}
	try {
		// Ensure users exist
		await Promise.all([
			getUserOrThrow({ id: userId }),
			getUserOrThrow({ id: targetUserId }),
		]);
		// Check if targetUser is already blocked
		// Note that I'm already enforcing @@unique, but apparently this is best practice
		// Avoids DB errors as flow control so I'm  "avoiding failure" instead of "handling it"
		if (await alreadyBlocked(userId, targetUserId)) {
			throw new AppError({
				statusCode: 409,
				code: BLOCK_LIST_ERRORS.ALREADY,
				message: "User is already blocked",
			});
		}

		await prisma.blockList.create({
			data: {
				blockerId: userId,
				blockedId: targetUserId,
			},
		});

		// Return the newly blocked user
		return getUserOrThrow({ id: targetUserId });
	} catch (err) {
		// Known/Expected errors bubble up to controller as AppError (custom error)
		if (err instanceof Prisma.PrismaClientKnownRequestError) {
			if (err.code === "P2002") {
				throw new AppError({
					statusCode: 409,
					code: BLOCK_LIST_ERRORS.ADD,
					message: "User is already blocked",
				});
			}
		}
		if (err instanceof AppError) throw err;
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}

// Unblock a user
export async function unblockUser(userId: string, targetUserId: string) {
	if (userId === targetUserId) {
		throw new AppError({
			statusCode: 400,
			code: BLOCK_LIST_ERRORS.SELF,
			message: "Cannot unblock yourself",
		});
	}
	try {
		// Ensure users exist
		await Promise.all([
			getUserOrThrow({ id: userId }),
			getUserOrThrow({ id: targetUserId }),
		]);

		const result = await prisma.blockList.deleteMany({
			where: { blockerId: userId, blockedId: targetUserId },
		});
		// deleteMany doesn't throw is anything is deleted. So I have to check how many rows where deleted
		if (result.count === 0) {
			throw new AppError({
				statusCode: 404,
				code: BLOCK_LIST_ERRORS.DELETE,
				message: "User was not blocked",
			});
		}
	} catch (err) {
		// Known/Expected errors bubble up to controller as AppError (custom error)
		if (err instanceof AppError) throw err;
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}
