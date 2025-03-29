import { FastifyReply, FastifyRequest } from "fastify";
import { createUserInput, createUserResponseSchema, loginInput, loginResponseSchema, userArrayResponseSchema } from "./user.schema";
import { createUser, findUserByEmail, findUsers } from "./user.service";
import { AppError } from "../../utils/errors";
import { verifyPassword } from "../../utils/hash";
import { server } from "../../app";

// MR_NOTE:
// With "parse" Zod will filter out fields not in the schema (e.g., salt, password).
// With safeParse is for adding an extra layer of security (since it comes from the user).

export async function registerUserHandler(
	request: FastifyRequest<{ Body: createUserInput }>,
	reply: FastifyReply,
) {
	try{
		const user = await createUser(request.body);
		// Serialize/validate/filter response via Zod schemas (createUserResponseSchema.parse)
		const parsedUser = createUserResponseSchema.parse(user);
		return reply.code(201).send(parsedUser);
	} catch(e) {
		console.error("Register user failed:", e);
		if (e instanceof AppError) {
			return reply.code(e.statusCode).send({ message: e.message });
		}
		// TODO: Maybe add a throw here to reach the global error handler?
		return reply.code(500).send({ message: "Internal server error" });
	}
}

export async function loginHandler(
	request: FastifyRequest<{ Body: loginInput }>,
	reply: FastifyReply,
) {
	const body = request.body;
	try {
		const user = await findUserByEmail(body.email)
		if (!user) {
			return reply.code(401).send({ message: "Invalid email or password" });
		}
		// Verify password.
		const candidatePassword = body.password;
		const correctPassword = verifyPassword({
			candidatePassword,
			salt: user.salt,
			hash: user.passwordHash,
		})
		if (!correctPassword) {
			return reply.code(401).send({ message: "Invalid email or password" });
		}
		const {passwordHash, salt, ...rest} = user;
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