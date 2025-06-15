import { Prisma } from "@prisma/client";
import { AppError, FRIEND_ERRORS, USER_ERRORS } from "../../utils/errors";
import { hashPassword } from "../../utils/hash";
import prisma from "../../utils/prisma";
import {
	createUserInput,
	UpdateUserData,
	SortDirection,
	UserPublicField,
	UniqueUserField,
	UserField,
} from "./user.schema";

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
		throw new Error("Password cannot contain the username");
	}
	if (
		userData.nickname &&
		lowerPassword.includes(userData.nickname.toLowerCase())
	) {
		throw new Error("Password cannot contain the nickname");
	}
	if (userData.email && lowerPassword === userData.email.toLowerCase()) {
		throw new Error("Password cannot be same as the email");
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
			code: USER_ERRORS.USER_CREATE,
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
						code: USER_ERRORS.USER_CREATE,
						message: `${capitalize(target)} already exists`,
					});
				case "P2003":
					throw new AppError({
						statusCode: 400,
						code: USER_ERRORS.USER_CREATE,
						message: "Invalid foreign key",
					});
			}
		}
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}

// Helper function to retrieve a user from the database
async function getUserOrThrow(where: UniqueUserField) {
	const user = await prisma.user.findUnique({ where });

	if (!user) {
		throw new AppError({
			statusCode: 404,
			code: USER_ERRORS.NOT_FOUND,
			message: "User not found",
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

// Type definition for query options
type UserQueryOptions = {
	where?: UserField; // To filter by UserField
	useFuzzy?: boolean; // To allow partial matches
	useOr?: boolean; // To allow OR logic
	dateTarget?: "createdAt" | "updatedAt" | "both";
	before?: Date;
	after?: Date;
	between?: [Date, Date];
	skip?: number; // To skip the first n entries
	take?: number; // To limit the number of returned entries
	sortBy?: UserPublicField; // To sort by id, email, username, nickname, createdAt, updatedAt
	order?: SortDirection; // to order asc/desc
};

// TODO: MR: Check if I can avoid using keyword `any`
// Function for searching users. It supports OR (`useOr`) and fuzzy search (`contains`)
export async function findUsers(options: UserQueryOptions = {}) {
	// Remove undefined fields from the full options object
	const cleanedOptions = Object.fromEntries(
		Object.entries(options).filter(([_, v]) => v !== undefined),
	) as UserQueryOptions;

	const {
		where = {},
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

	// console.log("✅ Step 1: Received Cleaned Options", cleanedOptions);

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
		// Apply date filters to 'createdAt'
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

		if (dateTarget === "both") {
			applyDateFilter("createdAt");
			applyDateFilter("updatedAt");
		} else {
			//applyDateFilter(dateTarget ?? "createdAt");
			applyDateFilter(dateTarget);
		}

		// console.log("✅ Step 2: Transformed 'where'", transformed);
		// Enable OR queries (map provided fields to build individual queries)
		const query = useOr
			? { OR: Object.entries(transformed).map(([k, v]) => ({ [k]: v })) }
			: // : transformed;
			  Object.fromEntries(
					Object.entries(transformed).filter(
						([_, v]) => v !== undefined,
					),
			  );

		// console.log("✅ Step 3: Final Query Shape", query);

		const prismaSortBy = { [sortBy]: order };

		// console.log("✅ Step 4: Final Prisma Query", {
		// 	where: query,
		// 	orderBy: prismaSortBy,
		// 	skip,
		// 	take,
		// });

		const users = await prisma.user.findMany({
			where: query,
			orderBy: prismaSortBy,
			skip,
			take,
		});

		// console.log("✅ Step 5: Result", users);

		if (!users.length) {
			throw new AppError({
				statusCode: 404,
				code: USER_ERRORS.NOT_FOUND,
				message: "No users found",
			});
		}

		return users;
	} catch (err) {
		// console.log("❌ Step 6: Error Caught", err);
		// Known/Expected errors bubble up to controller as AppError (custom error)
		if (err instanceof Prisma.PrismaClientValidationError) {
			throw new AppError({
				statusCode: 400,
				code: USER_ERRORS.INVALID_SORT,
				message: `Invalid sortBy field: ${sortBy}`,
			});
		}

		if (err instanceof AppError) throw err;

		// console.error("❌ Step 6.2: Unknown error", err);
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
				code: USER_ERRORS.USER_DELETE,
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
					code: USER_ERRORS.USER_UPDATE,
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
						code: USER_ERRORS.USER_UPDATE,
						message: `${capitalize(field)} already exists`,
					});
				case "P2003":
					throw new AppError({
						statusCode: 400,
						code: USER_ERRORS.USER_UPDATE,
						message: "Invalid foreign key",
					});
				case "P2025":
					throw new AppError({
						statusCode: 404,
						code: USER_ERRORS.USER_UPDATE,
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
						code: USER_ERRORS.USER_PICTURE,
						message: "User not found",
					});
			}
		}
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}

export async function getUserFriends(id: string) {
	try {
		await getUserOrThrow({ id }); // Ensure users exist
		const friendships = await prisma.friendship.findMany({
			where: {
				OR: [{ user1Id: id }, { user2Id: id }],
			},
			include: {
				user1: true,
				user2: true,
			},
		});
		return friendships.map((f) => (f.user1Id === id ? f.user2 : f.user1));
	} catch (err) {
		// Known/Expected errors bubble up to controller as AppError (custom error)
		if (err instanceof Prisma.PrismaClientKnownRequestError) {
			throw new AppError({
				statusCode: 400,
				code: FRIEND_ERRORS.GET_FRIEND, // or define a new FRIENDSHIP_ERRORS.FETCH
				message: "Failed to fetch friends",
			});
		}
		if (err instanceof AppError) throw err;
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}

export async function addFriend(userId: string, targetUserId: string) {
	if (userId === targetUserId) {
		throw new AppError({
			statusCode: 400,
			code: FRIEND_ERRORS.ADD_FRIEND,
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

		await prisma.friendship.create({
			data: { user1Id, user2Id },
		});
	} catch (err) {
		// Known/Expected errors bubble up to controller as AppError (custom error)
		if (err instanceof Prisma.PrismaClientKnownRequestError) {
			if (err.code === "P2002") {
				throw new AppError({
					statusCode: 409,
					code: FRIEND_ERRORS.ADD_FRIEND,
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
			code: FRIEND_ERRORS.DELETE_FRIEND,
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
				code: FRIEND_ERRORS.DELETE_FRIEND,
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
