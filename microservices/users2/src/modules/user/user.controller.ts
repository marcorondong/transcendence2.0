import { FastifyReply, FastifyRequest } from "fastify";
import { createUserInput, createUserSchema, createUserResponseSchema, loginInput, loginSchema, loginResponseSchema, userArrayResponseSchema } from "./user.schema";
import { createUser, findUserByEmail, findUsers } from "./user.service";
import { verifyPassword } from "../../utils/hash";
import { server } from "../../app";

// MR_Note: Old function which didnt use automatic Zod for validation/serialization.
// export async function registerUserHandler(
// 	request: FastifyRequest<{
// 		Body: createUserInput;
// 	}>,
// 	reply: FastifyReply
// ) {
// 	const body = request.body
// 	try{
// 		const user = await createUser(body);
// 		return reply.code(201).send(user);
// 	}catch(e) {
// 		console.log(e)
// 		return reply.code(500).send(e);
// 		// return reply.code(500).send({ message: "Internal Server Error" });
// 	}
// }

// MR_Note: Old function which didnt use automatic Zod for validation/serialization.
// export async function registerUserHandler(
// 	request: FastifyRequest<{
// 		Body: createUserInput;
// 	}>,
// 	reply: FastifyReply
// ) {
// 	const body = request.body
// 	try{
// 		const user = await createUser(body);
// 		// Filter response via Zod
// 		const parsedUser = createUserResponseSchema.parse(user);
// 		return reply.code(201).send(parsedUser);
// 	}catch(e) {
// 		console.log(e)
// 		// TODO: I should check what was the error and then return the correcr code (e.g: 409 Conflict).
// 		return reply.code(500).send(e);
// 	}
// }

export async function registerUserHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	// Use safeParse for extra safety
	const result = createUserSchema.safeParse(request.body);
	if (!result.success) {
		return reply.code(400).send({
			message: "Invalid request data",
			errors: result.error.flatten(),
		});
	}
	const body = result.data;
	try{
		const user = await createUser(body);
		// Filter response via Zod
		const parsedUser = createUserResponseSchema.parse(user);
		return reply.code(201).send(parsedUser);
	}catch(e) {
		console.log(e)
		// // Example: Handle unique email constraint (conflict)
		// if (e.code === "P2002") {
		// 	return reply.code(409).send({ message: "Email already exists" });
		// }
		// TODO: I should check what was the error and then return the correcr code (e.g: 409 Conflict).
		return reply.code(500).send(e);
	}
}

// MR_Note: Old function which didnt use automatic Zod for validation/serialization.
// export async function loginHandler(
// 	request: FastifyRequest<{
// 		Body: loginInput
// 	}>,
// 	reply: FastifyReply
// ) {
// 	const body = request.body
// 	// Find user by email
// 	const user = await findUserByEmail(body.email)
// 	if (!user) {
// 		return reply.code(401).send({
// 			message: "Invalid email or password",
// 		});
// 	}
// 	// Veryfy password.
// 	const correctPassword = verifyPassword({
// 		candidatePassword: body.password,
// 		salt: user.salt,
// 		hash: user.password
// 	})
// 	if (correctPassword) {
// 		const {password, salt, ...rest} = user
// 		// Generate access token
// 		return { accessToken: server.jwt.sign(rest) };
// 	}
// 	return reply.code(401).send({
// 		message: "Invalid email or password",
// 	});
// }

export async function loginHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	// Use safeParse for extra safety
	const result = loginSchema.safeParse(request.body);
	if (!result.success) {
		return reply.code(400).send({
			message: "Invalid request data",
			errors: result.error.flatten(),
			// TODO: For what is "flatten"?
		});
	}
	const body = result.data
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
		hash: user.password,
	})
	if (!correctPassword) {
		return reply.code(401).send({ message: "Invalid email or password" });
	}
	const {password, salt, ...rest} = user;
	// TODO: Maybe this JWT part should be handled by Autentication Service
	// TODO: I should enforce return type (check https://chatgpt.com/c/67db0437-6944-8005-95f2-21ffe52eedda#:~:text=ChatGPT%20said%3A-,ANSWER004,-Great%20to%20hear)
	// Generate access token
	const accessToken = server.jwt.sign(rest);
	// Validate response via Zod
	const parsedToken = loginResponseSchema.parse({ accessToken });
	return reply.code(200).send(parsedToken);
}

// MR_Note: Old function which didnt use automatic Zod for validation/serialization.
// export async function getUsersHandler() {
// 	const users = await findUsers();
// 	return users;  // Fastify auto-validates response using Zod schema defined in route
// }

export async function getUsersHandler() {
	const users = await findUsers();  // returns all fields
	// With "parse" Zod will filter out fields not in the schema (e.g., salt, password)
	return userArrayResponseSchema.parse(users); // Fastify auto-validates response using Zod schema defined in route
}