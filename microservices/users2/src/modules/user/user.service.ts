import { Prisma } from "@prisma/client";
import { AppError, USER_ERRORS } from "../../utils/errors";
import { hashPassword } from "../../utils/hash";
import prisma from "../../utils/prisma";
import { createUserInput } from "./user.schema";

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

// Type definition to allow one field per query
type UniqueUserField = { id: number } | { name: string } | { email: string };

// This function returns all user fields (no filtering)
export async function findUserByUnique(where: UniqueUserField) {
	try {
		const user = await prisma.user.findUnique({ where });
		if (!user) {
			// Known/Expected errors bubble up to controller as AppError (custom error)
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

// This function returns all users with all fields (no filtering)
export async function findUsers() {
	const users = await prisma.user.findMany();
	return users;
}
