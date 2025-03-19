import { FastifyReply, FastifyRequest } from "fastify";
import { createUserInput, loginInput } from "./user.schema";
import { createUser, findUserByEmail, findUsers } from "./user.service";
import { verifyPassword } from "../../utils/hash";
import { server } from "../../app";

export async function registerUserHandler(
	request: FastifyRequest<{
		Body: createUserInput;
	}>,
	reply: FastifyReply
) {
	const body = request.body
	try{
		const user = await createUser(body);
		return reply.code(201).send(user);
	}catch(e) {
		console.log(e)
		// TODO: I should check what was the error and then return the correcr code (e.g: 409 Conflict).
		return reply.code(500).send(e);
	}
}

export async function loginHandler(
	request: FastifyRequest<{
		Body: loginInput
	}>,
	reply: FastifyReply
) {
	const body = request.body
	// Find user by email
	const user = await findUserByEmail(body.email)
	if (!user) {
		return reply.code(401).send({
			message: "Invalid email or password",
		});
	}
	// TODO: Remane password to passwordHash
	// Veryfy password.
	const correctPassword = verifyPassword({
		candidatePassword: body.password,
		salt: user.salt,
		hash: user.password
	})
	if (correctPassword) {
		const {password, salt, ...rest} = user
		// Generate access token
		// TODO: Maybe this JWT part should be handled by Autentication Service
		// TODO: I should enforce return type (check https://chatgpt.com/c/67db0437-6944-8005-95f2-21ffe52eedda#:~:text=ChatGPT%20said%3A-,ANSWER004,-Great%20to%20hear)
		return { accessToken: server.jwt.sign(rest) };
	}
	return reply.code(401).send({
		message: "Invalid email or password",
	});
}

export async function getUsersHandler() {
	const users = await findUsers()
	return users;
}