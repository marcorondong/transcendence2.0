import prisma from '../../utils/prisma';
import { CreateUserInput } from './user.schema';
import { hashPassword } from '../../server';
import { myFastifyServer } from '../../server';

export async function createUser(input: CreateUserInput, reply: any) {

	// const userExists = await prisma.user.findFirst({
	// 	where: {
	// 		email: input.email,
	// 	},
	// });
	// if (userExists) {
	// 	return reply.code(401).send({
	// 		message: 'User already exists with this email',
	// 	  })
	// }

	const hashedPassword = await hashPassword(input.password);
	const user = await prisma.user.create({
		data: { ...input, password: hashedPassword },
	});
	console.log('user', user);
	return user;
}

export async function findUserByEmail(email: string) {
	const user = await prisma.user.findUnique({
		where: {
			email: email,
		},
	});
	return user;
}

export async function verifyPassword(password: string, hashedPassword: string) {

	const isMatch = await myFastifyServer.bcrypt.compare(password, hashedPassword);
	return isMatch;
}

export async function generateAccessToken(user: any) {

	const token = myFastifyServer.jwt.sign({ user });
	return token;
}