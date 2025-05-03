import { Prisma } from "@prisma/client";
import { AppError, USER_ERRORS } from "../../utils/errors";
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

// Helper function to check password constraints (no username/email)
function checkPasswordConstraints(
	password: string,
	userData: { username: string; email: string },
) {
	const lowerPassword = password.toLowerCase();
	if (userData.username && lowerPassword.includes(userData.username.toLowerCase())) {
		throw new Error("Password cannot contain the username");
	}
	if (userData.email && lowerPassword === userData.email.toLowerCase()) {
		throw new Error("Password cannot be same as the email");
	}
}

export async function createUser(input: createUserInput) {
	const { password, ...rest } = input;
	try {
		checkPasswordConstraints(password, {
			username: rest.username,
			email: rest.email,
		});
	} catch (err) {
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

// Type definition for query options
type UserQueryOptions = {
	where?: UserField; // To filter by UserField
	useFuzzy?: boolean; // To allow partial matches
	useOr?: boolean; // To allow OR logic
	skip?: number; // To skip the first n entries
	take?: number; // To limit the number of returned entries
	sortBy?: UserPublicField; // To sort by id, email, username
	order?: SortDirection; // to order asc/desc
};

// TODO: MR: Check if I can avoid using keyword `any`
// Function for searching users. It supports OR (`useOr`) and fuzzy search (`contains`)
export async function findUsers(options: UserQueryOptions = {}) {
	// let {
	const {
		where = {},
		useFuzzy = false,
		useOr = false,
		skip,
		take,
		sortBy = "id",
		order = "asc",
	} = options;
	// console.log("✅ Step 1: Received Options", options);
	try {
		// Enable fuzzy search (transform string fields to `contains` filters)
		const transformed = Object.entries(where).reduce(
			(acc, [key, value]) => {
				if (typeof value === "string" && useFuzzy) {
					acc[key] = { contains: value };
				} else {
					acc[key] = value;
				}
				return acc;
			},
			{} as Record<string, any>,
		);
		// console.log("✅ Step 2: Transformed 'where'", transformed);
		// Enable OR queries (map provided fields to build individual queries)
		const query = useOr
			? { OR: Object.entries(transformed).map(([k, v]) => ({ [k]: v })) }
			: transformed;
		// console.log("✅ Step 3: Final Query Shape", query);
		const prismaSortBy = { [sortBy]: order };
		// console.log("✅ Step 4: Final Prisma Query", { where: query, orderBy: prismaSortBy, skip, take, });
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
		if (err instanceof Prisma.PrismaClientValidationError) {
			throw new AppError({
				statusCode: 400,
				code: USER_ERRORS.INVALID_SORT,
				message: `Invalid sortBy field: ${sortBy}`,
			});
		}
		if (err instanceof AppError) throw err;
		// console.error("❌ Step 6.2: Unknown error", err);
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

export async function updateUser(id: number, data: UpdateUserData) {
	try {
		const updatePayload: Record<string, any> = { ...data };
		if (data.password) {
			// Find user for password constrains check
			const currentUser = await prisma.user.findUnique({ where: { id } });
			if (!currentUser) {
				throw new AppError({
					statusCode: 404,
					code: USER_ERRORS.USER_UPDATE,
					message: "User not found",
				});
			}
			// Check password constraints
			try {
				checkPasswordConstraints(data.password, {
					username: data.username ?? currentUser.username,
					email: data.email ?? currentUser.email,
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
