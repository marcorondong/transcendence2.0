import { FastifyReply, FastifyRequest } from "fastify";
import {
	createUserInput,
	userResponseSchema,
	loginInput,
	loginResponseSchema,
	userArrayResponseSchema,
	getUsersQuery,
	updateUserPutInput,
	updateUserPatchInput,
} from "./user.schema";
import {
	createUser,
	findUserByUnique,
	findUsers,
	deleteUser,
	updateUser,
} from "./user.service";
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
	// Serialize/validate/filter response via Zod schemas (userResponseSchema.parse)
	const parsedUser = userResponseSchema.parse(user);
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
		const user = await findUserByUnique({ email }); // Might throw 404 Not Found
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
		// TODO: Without AUTH service (token generation logic)
		// // Generate access token
		// const accessToken = server.jwt.sign(rest);
		// // Serialize/validate/filter response via Zod schemas (loginResponseSchema.parse)
		// const parsedToken = loginResponseSchema.parse({ accessToken });
		// return reply.code(200).send(parsedToken);
		//
		// TODO: With AUTH service (just reply with data to include in JWT token)
		const parsedResponse = loginResponseSchema.parse(rest);
		// return reply.code(200).send({ id: user.id, nickname: user.nickname });
		return reply.code(200).send(parsedResponse);
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

export async function getUserHandler(
	// request: FastifyRequest<{ Params: { id: number } }>,
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply,
) {
	const user = await findUserByUnique({ id: request.params.id });
	const parsedUser = userResponseSchema.parse(user);
	return reply.code(200).send(parsedUser);
}

export async function getUsersHandler(
	request: FastifyRequest<{ Querystring: getUsersQuery }>,
	reply: FastifyReply,
) {
	const {
		id,
		email,
		username,
		nickname,
		createdAt,
		updatedAt,
		dateTarget,
		before,
		after,
		between,
		useFuzzy,
		useOr,
		skip,
		take,
		sortBy,
		order,
	} = request.query;

	// Convert exact dateStrings to Date objects
	const createdAtDate = createdAt ? new Date(createdAt) : undefined;
	const updatedAtDate = updatedAt ? new Date(updatedAt) : undefined;

	// Convert range filters
	const beforeDate = before ? new Date(before) : undefined;
	const afterDate = after ? new Date(after) : undefined;
	const betweenDates = between
		? ([new Date(between[0]), new Date(between[1])] as [Date, Date])
		: undefined;

	const users = await findUsers({
		where: {
			id,
			email,
			username,
			nickname,
			createdAt: createdAtDate,
			updatedAt: updatedAtDate,
		},
		useFuzzy,
		useOr,
		dateTarget,
		before: beforeDate,
		after: afterDate,
		between: betweenDates,
		skip,
		take,
		sortBy,
		order,
	});
	const parsedUsers = userArrayResponseSchema.parse(users);
	return reply.code(200).send(parsedUsers);
}

export async function deleteUserHandler(
	// request: FastifyRequest<{ Params: { id: number } }>,
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply,
) {
	await deleteUser(request.params.id);
	return reply.code(204).send();
}

export async function putUserHandler(
	request: FastifyRequest<{
		// Params: { id: number };
		Params: { id: string };
		Body: updateUserPutInput;
	}>,
	reply: FastifyReply,
) {
	const updatedUser = await updateUser(request.params.id, request.body);
	const parsed = userResponseSchema.parse(updatedUser);
	return reply.code(200).send(parsed);
}

export async function patchUserHandler(
	request: FastifyRequest<{
		// Params: { id: number };
		Params: { id: string };
		Body: updateUserPatchInput;
	}>,
	reply: FastifyReply,
) {
	const updatedUser = await updateUser(request.params.id, request.body);
	const parsed = userResponseSchema.parse(updatedUser);
	return reply.code(200).send(parsed);
}
