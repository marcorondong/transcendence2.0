import { Prisma } from "@prisma/client";
import { AppError, USER_ERRORS } from "../../utils/errors";
import { hashPassword } from "../../utils/hash";
import prisma from "../../utils/prisma";
import { createUserInput, UpdateUserData } from "./user.schema";

// Helper function to capitalize conflicting Prisma field
function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function createUser(input: createUserInput) {
	const { password, ...rest } = input;
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
				// case "P2025":
				// TODO: Check when this error happens. (in mutations: update, delete, etc.)
				// throw new AppError({
				// 	statusCode: 404,
				// 	code: USER_ERRORS.NOT_FOUND,
				// 	message: "User not found",
				// });
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

// TODO: Check if all these new type definitions could be put in user.schema.ts
// Type definition to allow one field per query
type UniqueUserField = { id: number } | { name: string } | { email: string };

// This function returns all user fields (no filtering)
export async function findUserByUnique(where: UniqueUserField) {
	try {
		const user = await prisma.user.findUnique({ where });
		if (!user) {
			throw new AppError({
				statusCode: 404,
				code: USER_ERRORS.NOT_FOUND,
				message: "User not found",
			});
		}
		return user;
	} catch (err) {
		if (err instanceof AppError) {
			// Known/Expected errors bubble up to controller as AppError (custom error)
			throw err;
		}
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}

// Type definition to allowing multiple User fields per query
type UserField = { id?: number; email?: string; name?: string };

// Type definition for sorting by field (from User fields)(This allows adding more fields than UserField too)
type SortByField = keyof UserField; // | "_rank" | "createdAt"; // Extend as needed

// Type definition for query options
type UserQueryOptions = {
	where?: UserField; // To filter by UserField
	useFuzzy?: boolean; // To allow partial matches
	useOr?: boolean; // To allow OR logic
	skip?: number; // To skip the first n entries
	take?: number; // To limit the number of returned entries
	sortBy?: SortByField; // To sort by key, like "id" or "name" (from UserField but extended)
	order?: "asc" | "desc"; // Ascending or descending
};

// TODO: MR: Check if better to allow findUsers() and findUsers({}), or only `findUsers({})`
// TODO: MR: Check if I can avoid using keyword `any`
// Function for searching users. It supports OR (`useOr`) and fuzzy search (`contains`)
export async function findUsers(options: UserQueryOptions = {}) {
	const {
		where = {},
		useFuzzy = false,
		useOr = false,
		skip,
		take,
		sortBy = "id",
		order = "asc",
	} = options;
	try {
		// Transform string fields to `contains` filters if fuzzy search is enabled
		const transformed = Object.entries(where).reduce(
			(acc, [key, value]) => {
				if (typeof value === "string" && useFuzzy) {
					acc[key] = { contains: value, mode: "insensitive" };
				} else {
					acc[key] = value;
				}
				return acc;
			},
			{} as Record<string, any>,
		);
		// TODO: Fix this comment: Allow OR queries (map fields to own )
		const query = useOr
			? { OR: Object.entries(transformed).map(([k, v]) => ({ [k]: v })) }
			: transformed;
		const prismaSortBy = { [sortBy]: order };
		const users = await prisma.user.findMany({
			where: query,
			orderBy: prismaSortBy,
			skip,
			take,
		});
		if (!users.length) {
			throw new AppError({
				statusCode: 404,
				code: USER_ERRORS.NOT_FOUND,
				message: "No users found",
			});
		}
		return users;
	} catch (err) {
		if (err instanceof Prisma.PrismaClientValidationError) {
			throw new AppError({
				statusCode: 400,
				code: USER_ERRORS.INVALID_SORT,
				message: `Invalid sortBy field: ${sortBy}`,
			});
		}
		if (err instanceof AppError) throw err;
		throw err;
	}
}

export async function deleteUser(id: number): Promise<void> {
	try {
		await prisma.user.delete({ where: { id } });
	} catch (err) {
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
		throw err;
	}
}

// // This function returns the deleted user
// export async function deleteUser(id: number) {
// 	try {
// 		const deletedUser = await prisma.user.delete({
// 			where: { id },
// 		});
// 		return deletedUser; // TODO: Should I return a "deleteUser"? or just empty/null? what does prisma return?
// 	} catch (err) {
// 		if (err instanceof Prisma.PrismaClientKnownRequestError) {
// 			if (err.code === "P2025") {
// 				// Record to delete does not exist
// 				throw new AppError({
// 					statusCode: 404,
// 					code: USER_ERRORS.USER_DELETE,
// 					message: "User not found",
// 				});
// 			}
// 		}
// 		throw err;
// 	}
// }

export async function updateUser(id: number, data: UpdateUserData) {
	try {
		const updatePayload: Record<string, any> = { ...data };
		// Hash password if provided
		if (data.password) {
			const { salt, hash } = hashPassword(data.password);
			updatePayload.passwordHash = hash;
			updatePayload.salt = salt;
			delete updatePayload.password; // remove plain password
		}
		const updatedUser = await prisma.user.update({
			where: { id },
			data: updatePayload,
		});
		return updatedUser;
	} catch (err) {
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
		throw err;
	}
}

// // This function returns all user fields (no filtering)
// export async function findUserBy(where: UserField) {
// 	try {
// 		const user = await prisma.user.findFirst({ where });
// 		if (!user) {
// 			throw new AppError({
// 				statusCode: 404,
// 				code: USER_ERRORS.NOT_FOUND,
// 				message: "User not found",
// 			});
// 		}
// 		return user;
// 	} catch (err) {
// 		if (err instanceof AppError) {
// 			// Known/Expected errors bubble up to controller as AppError (custom error)
// 			throw err;
// 		}
// 		// Unknown errors bubble up to global error handler.
// 		throw err;
// 	}
// }

// // This function returns all user fields (no filtering)
// export async function getUserById(id: number) {
// 	try {
// 		const user = await prisma.user.findUnique({ where: { id } });
// 		if (!user) {
// 			// Known/Expected errors bubble up to controller as AppError (custom error)
// 			throw new AppError({
// 				statusCode: 404,
// 				code: USER_ERRORS.NOT_FOUND,
// 				message: "User not found",
// 			});
// 		}
// 		return user;
// 	} catch (err) {
// 		if (err instanceof AppError) {
// 			// Known/Expected errors bubble up to controller as AppError (custom error)
// 			throw err;
// 		}
// 		// Unknown errors bubble up to global error handler.
// 		throw err;
// 	}
// }

// // This function returns all user fields (no filtering)
// export async function getUserByEmail(email: string) {
// 	try {
// 		const user = await prisma.user.findUnique({ where: { email } });
// 		if (!user) {
// 			// Known/Expected errors bubble up to controller as AppError (custom error)
// 			throw new AppError({
// 				statusCode: 404,
// 				code: USER_ERRORS.NOT_FOUND,
// 				message: "User not found",
// 			});
// 		}
// 		return user;
// 	} catch (err) {
// 		if (err instanceof AppError) {
// 			// Known/Expected errors bubble up to controller as AppError (custom error)
// 			throw err;
// 		}
// 		// Unknown errors bubble up to global error handler.
// 		throw err;
// 	}
// }

// // This function returns all users with all fields (no filtering)
// export async function findUsers() {
// 	const users = await prisma.user.findMany();
// 	return users;
// }
