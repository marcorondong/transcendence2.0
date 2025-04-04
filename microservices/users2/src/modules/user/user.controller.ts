import { FastifyReply, FastifyRequest } from "fastify";
import {
	createUserInput,
	createUserResponseSchema,
	loginInput,
	loginResponseSchema,
	userArrayResponseSchema,
} from "./user.schema";
import { createUser, findUserByEmail, findUsers } from "./user.service";
import { AppError, USER_ERRORS } from "../../utils/errors";
import { verifyPassword } from "../../utils/hash";
import { server } from "../../app";

// MR_NOTE:
// With "parse" Zod will filter out fields not in the schema (e.g., salt, password).
// safeParse is for adding an extra layer of security (since it comes from the user).

export async function registerUserHandler(
	request: FastifyRequest<{ Body: createUserInput }>,
	reply: FastifyReply,
) {
	const user = await createUser(request.body);
	// Serialize/validate/filter response via Zod schemas (createUserResponseSchema.parse)
	const parsedUser = createUserResponseSchema.parse(user);
	return reply.code(201).send(parsedUser);
}

// TODO: Maybe this JWT part should be handled by Authentication Service
// TODO: I should enforce return type (check https://chatgpt.com/c/67db0437-6944-8005-95f2-21ffe52eedda#:~:text=ChatGPT%20said%3A-,ANSWER004,-Great%20to%20hear)

export async function loginHandler(
	request: FastifyRequest<{ Body: loginInput }>,
	reply: FastifyReply,
) {
	const { email, password } = request.body;
	try {
		const user = await findUserByEmail(email); // Might throw 404 Not Found
		const valid = verifyPassword({
			candidatePassword: password,
			hash: user.passwordHash,
			salt: user.salt,
		});
		if (!valid) {
			throw new AppError({
				statusCode: 401,
				code: USER_ERRORS.USER_LOGIN,
				message: "Invalid email or password",
			});
		}
		const { passwordHash, salt, ...rest } = user;
		// Generate access token
		const accessToken = server.jwt.sign(rest);
		// Serialize/validate/filter response via Zod schemas (loginResponseSchema.parse)
		const parsedToken = loginResponseSchema.parse({ accessToken });
		return reply.code(200).send(parsedToken);
	} catch (err) {
		// If user not found or password invalid, always send same generic 401
		if (err instanceof AppError && err.statusCode === 404) {
			// Change 404 Not Found to 401 Invalid email or password (Hide sensitive info)
			throw new AppError({
				statusCode: 401,
				code: USER_ERRORS.USER_LOGIN,
				message: "Invalid email or password",
			});
		}
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}

// MR_NOTE: '_' replace "request" (used when parameter is not used)
export async function getUsersHandler(_: FastifyRequest, reply: FastifyReply) {
	const users = await findUsers();
	// Serialize/validate/filter response via Zod schemas (userArrayResponseSchema.parse)
	const parsedUsers = userArrayResponseSchema.parse(users);
	return reply.code(200).send(parsedUsers); // Fastify auto-validates response using Zod schema defined in route
}
