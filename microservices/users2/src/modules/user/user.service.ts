import { Prisma } from "@prisma/client";
import { AppError } from "../../utils/errors";
import { hashPassword } from "../../utils/hash";
import prisma from "../../utils/prisma";
import { createUserInput } from "./user.schema";

// Helper function to capitalize conflicting Prisma field 
function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function createUser(input: createUserInput) {
	const { password, ...rest } = input;
	const { salt, hash } = hashPassword(password)
	try {
		const user = await prisma.user.create({
			data: { ...rest, salt, passwordHash: hash },
		});
		return user;
	} catch (e) {
		if (e instanceof Prisma.PrismaClientKnownRequestError) {
			// Bubble up with a custom error
			switch (e.code) {
				case "P2002":
					const target = (e.meta?.target as string[])?.[0] ?? "field";
					throw new AppError(409, `${capitalize(target)} already exists`);
				case "P2025":
					throw new AppError(404, "User not found"); // TODO: Should I check this here?
				case "P2003":
					throw new AppError(400, "Invalid foreign key");
			}
		}
		throw e; // Unhandled errors go to 500 (Let controller handle unexpected errors)
	}
}

// TODO: Wrap inside try/catch block?
export async function findUserByEmail(email: string) {
	const user = await prisma.user.findUnique({
		where: {
			email,
		},
	});
	return user;
}

// MR_NOTE: This function returns all users with all fields (no filtering)
export async function findUsers() {
	const users = await prisma.user.findMany();
	return users;
}

// MR_NOTE: I could filter the returned field via a schema;
// But I can also doing directly in prisma like this:
// export async function findUsers() {
// 	return prisma.user.findMany( {
// 		select: {
// 			email: true,
// 			name: true,
// 			id: true,
// 		},
// 	});
// }