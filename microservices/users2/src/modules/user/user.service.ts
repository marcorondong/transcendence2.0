import { hashPassword } from "../../utils/hash";
import prisma from "../../utils/prisma";
import { createUserInput } from "./user.schema";

export async function createUser(input: createUserInput) {
	const { password, ...rest } = input;
	const { salt, hash } = hashPassword(password)
	const user = await prisma.user.create({
		data: { ...rest, salt, password: hash },
	});
	return user;
}

export async function findUserByEmail(email: string) {
	return prisma.user.findUnique({
		where: {
			email,
		},
	});
}

// MR_NOTE: This function returns all users with all fields (no filtering)
export async function findUsers() {
	return prisma.user.findMany();
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