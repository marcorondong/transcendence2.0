import { FastifyReply, FastifyRequest } from "fastify";
import fs from "fs"; // for createWriteStream
import { mkdir } from "fs/promises";
import path from "path";
import { pipeline } from "stream/promises";
import {
	UniqueUserField,
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
	updateUserPicture,
} from "./user.service";
import { AppError, USER_ERRORS } from "../../utils/errors";
import { verifyPassword } from "../../utils/hash";
import { getConfig } from "../../utils/config";

// MR_NOTE:
// With "parse" Zod will filter out fields not in the schema (e.g., salt, password).

export async function registerUserHandler(
	request: FastifyRequest<{ Body: createUserInput }>,
	reply: FastifyReply,
) {
	const user = await createUser(request.body);
	// Serialize/validate/filter response via Zod schemas (userResponseSchema.parse)
	const parsedUser = userResponseSchema.parse(user);
	return reply.code(201).send(parsedUser);
}

// Define valid login modes: "email", "username", or "email,username"
const LOGIN_IDENTIFIER_MODE = "email,username"; // Change this as needed

export async function loginHandler(
	request: FastifyRequest<{ Body: loginInput }>,
	reply: FastifyReply,
) {
	const { email, username, password } = request.body;
	// Determine allowed identifiers
	const allowedIdentifiers = LOGIN_IDENTIFIER_MODE.split(",").map((s) =>
		s.trim(),
	);
	let identifier: string | undefined;
	let userWhere: UniqueUserField;

	if (allowedIdentifiers.includes("email") && email) {
		identifier = email.toLowerCase(); // transform to lowercase emails
		userWhere = { email: identifier };
	} else if (allowedIdentifiers.includes("username") && username) {
		identifier = username.toLowerCase(); // transform to lowercase usernames
		userWhere = { username: identifier };
	} else {
		throw new AppError({
			statusCode: 400,
			code: USER_ERRORS.USER_LOGIN,
			message: "Login requires a valid email or username",
		});
	}

	try {
		const user = await findUserByUnique(userWhere); // Might throw 404 Not Found
		const valid = verifyPassword({
			candidatePassword: password,
			hash: user.passwordHash,
			salt: user.salt,
		});
		if (!valid) {
			throw new AppError({
				statusCode: 401,
				code: USER_ERRORS.USER_LOGIN,
				message: "Invalid credentials",
			});
		}
		// Explicitly exclude 'passwordHash' and 'salt' since we don't want to retrieve that info
		const { passwordHash, salt, ...rest } = user;
		// For testing purposes: Comment out line above and comment in line below to have full user info
		// const { ...rest } = user;
		// With AUTH service (just reply with data to include in JWT token)
		const parsedResponse = loginResponseSchema.parse(rest);
		return reply.code(200).send(parsedResponse);
	} catch (err) {
		// If user not found or password invalid, always send same generic 401
		if (err instanceof AppError && err.statusCode === 404) {
			// Change 404 Not Found to 401 Invalid credentials (Hide sensitive info)
			throw new AppError({
				statusCode: 401,
				code: USER_ERRORS.USER_LOGIN,
				message: "Invalid credentials",
			});
		}
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}

export async function getUserHandler(
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply,
) {
	const user = await findUserByUnique({ id: request.params.id });
	const parsedUser = userResponseSchema.parse(user);
	return reply.code(200).send(parsedUser);
}

// Helper function for pagination
function applyPagination(params: {
	all?: boolean;
	skip?: number;
	take?: number;
	page?: number;
}) {
	// console.log("[applyPagination] Raw params:", params);

	// Get config from utils function getConfig() (utils/config.ts)
	const config = getConfig();
	const paginationEnabled = config.PAGINATION_ENABLED === "true";
	const defaultPageSize = parseInt(config.DEFAULT_PAGE_SIZE || "10", 10);

	// If query string has "?all=true" then all results will be provided (no pagination)
	if (params.all === true || !paginationEnabled) {
		return { skip: undefined, take: undefined };
	}

	const take =
		typeof params.take === "number" ? params.take : defaultPageSize;

	// Enforce that both `page` and `skip` are not allowed together
	if (typeof params.page === "number" && typeof params.skip === "number") {
		// TODO: Use AppError here
		throw new Error("Cannot use both 'page' and 'skip' in the same query");
		// Comment out the line above to disable this validation
	}

	const skip =
		typeof params.page === "number"
			? (params.page - 1) * take
			: typeof params.skip === "number"
				? params.skip
				: 0;

	return { skip, take };
}

export async function getUsersHandler(
	request: FastifyRequest<{ Querystring: getUsersQuery }>,
	reply: FastifyReply,
) {
	// Log full query for debugging purposes
	// console.log("[Request Query]", request.query);

	// Destructure request query into respective fields
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
		skip: querySkip,
		take: queryTake,
		page,
		all,
		sortBy,
		order,
	} = request.query;

	const { skip, take } = applyPagination({
		all,
		skip: querySkip,
		take: queryTake,
		page,
	});
	// Log pagination results for debugging purposes
	// console.log(
	// 	`[Pagination] page: ${page}, skip: ${skip}, take: ${take}, all: ${all}`,
	// );

	// MR_NOTE: 'page' nor 'all' field aren't handled by service `findUsers()`;
	// since pagination is an abstraction for 'skip' and 'take'
	const users = await findUsers({
		where: {
			id,
			email,
			username,
			nickname,
			createdAt,
			updatedAt,
		},
		useFuzzy,
		useOr,
		dateTarget,
		before,
		after,
		between,
		skip,
		take,
		sortBy,
		order,
	});

	const parsedUsers = userArrayResponseSchema.parse(users);
	return reply.code(200).send(parsedUsers);
}

export async function deleteUserHandler(
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply,
) {
	await deleteUser(request.params.id);
	return reply.code(204).send();
}

export async function putUserHandler(
	request: FastifyRequest<{
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
		Params: { id: string };
		Body: updateUserPatchInput;
	}>,
	reply: FastifyReply,
) {
	const updatedUser = await updateUser(request.params.id, request.body);
	const parsed = userResponseSchema.parse(updatedUser);
	return reply.code(200).send(parsed);
}

export async function pictureHandler(
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply,
) {
	const user = await findUserByUnique({ id: request.params.id });

	const parts = request.parts();
	let pictureFile;
	for await (const part of parts) {
		if (part.type === "file" && part.fieldname === "picture") {
			pictureFile = part;
			break;
		}
	}

	if (!pictureFile) {
		throw new AppError({
			statusCode: 400,
			code: USER_ERRORS.USER_PICTURE,
			message: "No picture file uploaded",
		});
	}

	// File validation: max size 1MB, accepted types
	if (!["image/jpeg", "image/png"].includes(pictureFile.mimetype)) {
		throw new AppError({
			statusCode: 400,
			code: USER_ERRORS.USER_PICTURE,
			message: "Only JPEG or PNG files are allowed",
		});
	}
	// if (pictureFile.file.bytesRead > 1024 * 1024) {
	if (pictureFile.file.truncated) {
		throw new AppError({
			statusCode: 400,
			code: USER_ERRORS.USER_PICTURE,
			message: "File too large (max 1MB)",
		});
	}

	// Build destination path
	const uploadsBase = path.resolve("uploads/users");
	const userFolder = path.join(uploadsBase, user.username);
	const filePath = path.join(userFolder, "picture.jpg");
	console.log("Saving picture to:", filePath); // TODO: Remove this later

	await mkdir(userFolder, { recursive: true });
	// console.log(`Would run: mkdir(${userFolder}, { recursive: true })`);
	await pipeline(pictureFile.file, fs.createWriteStream(filePath));
	// console.log(
	// 	`Would run: pipeline(<picture stream>, createWriteStream(${filePath}))`,
	// );

	const publicPath = `/uploads/users/${user.username}/picture.jpg`;
	const updatedUser = await updateUserPicture(user.id, publicPath);

	reply.code(200).send(updatedUser);
}
