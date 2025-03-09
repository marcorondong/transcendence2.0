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