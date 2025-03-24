import { FastifyReply, FastifyRequest } from "fastify";
import { createUserSchema, createUserResponseSchema, loginInput, loginSchema, loginResponseSchema, userArrayResponseSchema } from "./user.schema";
import { createUser, findUserByEmail, findUsers } from "./user.service";
import { verifyPassword } from "../../utils/hash";
import { server } from "../../app";

// MR_NOTE:
// With "parse" Zod will filter out fields not in the schema (e.g., salt, password).
// With safeParse is for adding an extra layer of security (since it comes from the user).

export async function registerUserHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	// Serialize/validate/filter input via Zod schemas (createUserSchema.safeParse)
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
		// Serialize/validate/filter response via Zod schemas (createUserResponseSchema.parse)
		const parsedUser = createUserResponseSchema.parse(user);
		return reply.code(201).send(parsedUser);
	} catch(e) {
		// console.log(e)
		// // Example: Handle unique email constraint (conflict)
		// if (e.code === "P2002") {
		// 	return reply.code(409).send({ message: "Email already exists" });
		// }
		// TODO: I should check what was the error and then return the correcr code (e.g: 409 Conflict).
		// return reply.code(500).send(e);
		console.error("Register user failed:", e);
		return reply.code(500).send({ message: "Internal server error" });
	}
}

export async function loginHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	// Serialize/validate/filter input via Zod schemas (loginSchema.safeParse)
	const result = loginSchema.safeParse(request.body);
	if (!result.success) {
		return reply.code(400).send({
			message: "Invalid request data",
			errors: result.error.flatten(),
		});
	}
	const body = result.data
	try {
		const user = await findUserByEmail(body.email)
		if (!user) {
			return reply.code(401).send({ message: "Invalid email or password" });
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
		// Serialize/validate/filter response via Zod schemas (loginResponseSchema.parse)
		const parsedToken = loginResponseSchema.parse({ accessToken });
		return reply.code(200).send(parsedToken);
	} catch (e) {
		console.error("Login failed:", e);
		return reply.code(500).send({ message: "Internal server error" });
	}
}

export async function getUsersHandler(request: FastifyRequest, reply: FastifyReply) {
	try {
		const users = await findUsers();  // returns all fields
		// With "parse" Zod will filter out fields not in the schema (e.g., salt, password)
		// Serialize/validate/filter response via Zod schemas (userArrayResponseSchema.parse)
		const parsedUsers = userArrayResponseSchema.parse(users);
		return reply.code(200).send(parsedUsers); // Fastify auto-validates response using Zod schema defined in route
	} catch (e) {
		console.error("Get users failed:", e);
		return reply.code(500).send({ message: "Internal server error" });
	}
}