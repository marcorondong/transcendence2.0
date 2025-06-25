import { FastifyReply, FastifyRequest } from "fastify";
import fs from "fs"; // for createWriteStream, and promises (mkdir, readdir, unlink)
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
	addFriendInput,
	blockUserInput,
} from "./user.schema";
import {
	createUser,
	findUserByUnique,
	findUsers,
	deleteUser,
	updateUser,
	updateUserPicture,
	getUserFriends,
	addFriend,
	deleteFriend,
	getUserBlocked,
	blockUser,
	unblockUser,
} from "./user.service";
import { AppError, USER_ERRORS } from "../../utils/errors";
import { verifyPassword } from "../../utils/hash";
import getConfig from "../../utils/config";
import { logger } from "../../utils/logger";

// MR_NOTE:
// With "parse" Zod will filter out fields not in the schema (e.g., salt, password).

export async function registerUserHandler(
	request: FastifyRequest<{ Body: createUserInput }>,
	reply: FastifyReply,
) {
	logger.debug({
		"event.action": "Register User",
		"message": "registerUserHandler hit",
	});
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
	logger.debug({
		"event.action": "Login",
		"message": "loginHandler hit",
	});
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
			code: USER_ERRORS.LOGIN,
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
				code: USER_ERRORS.LOGIN,
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
				code: USER_ERRORS.LOGIN,
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
	logger.debug({
		"event.action": "Get single User",
		"message": "getUserHandler hit",
	});
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
	// logger.debug({
	// 	"event.action": "applyPagination",
	// 	"params": params,
	// 	"message": "[applyPagination] Raw params",
	// });

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
		// throw new Error("Cannot use both 'page' and 'skip' in the same query");
		throw new AppError({
			statusCode: 400,
			code: USER_ERRORS.INVALID_QUERY,
			// handlerName: "applyPagination",
			message: "Cannot use both 'page' and 'skip' in the same query",
		});
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
	logger.debug({
		"event.action": "Get Users - query params",
		"query": request.query,
		"message": "getUsersHandler hit",
	});
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
		filterIds,
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
	// logger.debug({
	// 	"event.action": "applyPagination",
	// 	"page": page,
	// 	"skip": skip,
	// 	"take": take,
	// 	"all": all,
	// 	"message": "[Pagination]",
	// });

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
		filterIds,
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
	logger.debug({
		"event.action": "Delete User",
		"message": "deleteUserHandler hit",
	});
	const user = await findUserByUnique({ id: request.params.id });

	const uploadsBase = path.resolve("uploads/users");
	const userFolder = path.join(uploadsBase, user.username);

	// Remove user folder here in controller, since service (should basically) handles database operations;
	logger.debug({
		"event.action": "deleteUserHandler",
		"message": "Deleting user picture if any",
	});
	if (fs.existsSync(userFolder)) {
		await fs.promises.rm(userFolder, { recursive: true, force: true });
	}

	await deleteUser(user.id);
	return reply.code(204).send();
}

export async function putUserHandler(
	request: FastifyRequest<{
		Params: { id: string };
		Body: updateUserPutInput;
	}>,
	reply: FastifyReply,
) {
	logger.debug({
		"event.action": "Update ALL User fields",
		"message": "putUserHandler hit",
	});
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
	logger.debug({
		"event.action": "Update SOME User fields",
		"message": "patchUserHandler hit",
	});
	const updatedUser = await updateUser(request.params.id, request.body);
	const parsed = userResponseSchema.parse(updatedUser);
	return reply.code(200).send(parsed);
}

// const ALLOWED_IMAGE_MODES = "image/jpeg"; // Enable more types if needed
const ALLOWED_IMAGE_MODES = "image/jpeg,image/png,image/gif"; // Example full config

const ALLOWED_IMAGE_TYPES = ALLOWED_IMAGE_MODES.split(",").reduce(
	(acc, type) => {
		acc[type] =
			type === "image/jpeg"
				? "jpg"
				: type === "image/png"
				? "png"
				: type === "image/gif"
				? "gif"
				: "";
		return acc;
	},
	{} as Record<string, string>,
);

export async function pictureHandler(
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply,
) {
	logger.debug({
		"event.action": "Update User Picture",
		"message": "pictureHandler hit",
	});
	const user = await findUserByUnique({ id: request.params.id }); // TODO: Check if I can make it "let" and reuse it

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
			code: USER_ERRORS.PICTURE,
			message: "No picture file uploaded",
		});
	}

	// TODO: Make these file checks (type/size) in Nginx config
	// Validate mimetype and map to extension
	const ext = ALLOWED_IMAGE_TYPES[pictureFile.mimetype];
	if (!ext) {
		throw new AppError({
			statusCode: 400,
			code: USER_ERRORS.PICTURE,
			message: "Unsupported file type",
		});
	}
	// if (pictureFile.file.bytesRead > 1024 * 1024) {
	if (pictureFile.file.truncated) {
		throw new AppError({
			statusCode: 400,
			code: USER_ERRORS.PICTURE,
			message: "File too large (max 1MB)",
		});
	}

	// Ensure destination folder exists
	const uploadsBase = path.resolve("uploads/users");
	const userFolder = path.join(uploadsBase, user.username);
	logger.debug("Saving picture to:", userFolder);
	await fs.promises.mkdir(userFolder, { recursive: true });
	// logger.debug(`Would run: mkdir(${userFolder}, { recursive: true })`);

	// Delete all files in the user's folder (remove old pictures)
	const oldFiles = await fs.promises.readdir(userFolder);
	for (const file of oldFiles) {
		await fs.promises.unlink(path.join(userFolder, file));
	}

	// Save new picture
	const filePath = path.join(userFolder, `picture.${ext}`);
	await pipeline(pictureFile.file, fs.createWriteStream(filePath));
	// logger.debug(
	// 	`Would run: pipeline(<picture stream>, createWriteStream(${filePath}))`,
	// );

	// Store relative path in DB
	const publicPath = `/uploads/users/${user.username}/picture.${ext}`;
	logger.debug({
		"event.action": "Saving Picture",
		"username": user.username,
		"path": publicPath,
		"message": `Saving ${user.username} picture in ${publicPath}`,
	});
	const updatedUser = await updateUserPicture(user.id, publicPath);

	const parsed = userResponseSchema.parse(updatedUser);
	return reply.code(200).send(parsed);
}

export async function getFriendsHandler(
	request: FastifyRequest<{
		Params: { id: string };
		Querystring: getUsersQuery;
	}>,
	reply: FastifyReply,
) {
	// Log full query for debugging purposes
	logger.debug({
		"event.action": "Get Users Friends - query params",
		"query": request.query,
		"message": "getFriendsHandler hit",
	});
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
		filterIds,
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
	// logger.debug({
	// 	"event.action": "applyPagination",
	// 	"page": page,
	// 	"skip": skip,
	// 	"take": take,
	// 	"all": all,
	// 	"message": "[Pagination]",
	// });

	// MR_NOTE: 'page' nor 'all' field aren't handled by service `findUsers()`;
	// since pagination is an abstraction for 'skip' and 'take'
	const friends = await getUserFriends(request.params.id, {
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
		filterIds,
		dateTarget,
		before,
		after,
		between,
		skip,
		take,
		sortBy,
		order,
	});

	const parsed = userArrayResponseSchema.parse(friends);
	return reply.code(200).send(parsed);
}

export async function addFriendHandler(
	request: FastifyRequest<{
		Params: { id: string };
		Body: addFriendInput;
	}>,
	reply: FastifyReply,
) {
	logger.debug({
		"event.action": "Add Friend",
		"id": request.params,
		"targetUserId": request.body,
		"message": "addFriendHandler hit",
	});
	const { id } = request.params;
	const { targetUserId } = request.body;

	const newFriend = await addFriend(id, targetUserId);
	const parsed = userResponseSchema.parse(newFriend);
	return reply.code(201).send(parsed);
}

export async function deleteFriendHandler(
	request: FastifyRequest<{
		Params: { id: string; targetUserId: string };
	}>,
	reply: FastifyReply,
) {
	logger.debug({
		"event.action": "Delete Friend",
		"id": request.params,
		"targetUserId": request.body,
		"message": "deleteFriendHandler hit",
	});
	await deleteFriend(request.params.id, request.params.targetUserId);
	return reply.code(204).send();
}

export async function getBlockedUsersHandler(
	request: FastifyRequest<{
		Params: { id: string };
		Querystring: getUsersQuery;
	}>,
	reply: FastifyReply,
) {
	// Log full query for debugging purposes
	logger.debug({
		"event.action": "Get User blockList - query params",
		"query": request.query,
		"message": "getBlockedUsersHandler hit",
	});
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
		filterIds,
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
	// logger.debug({
	// 	"event.action": "applyPagination",
	// 	"page": page,
	// 	"skip": skip,
	// 	"take": take,
	// 	"all": all,
	// 	"message": "[Pagination]",
	// });

	// MR_NOTE: 'page' nor 'all' field aren't handled by service `findUsers()`;
	// since pagination is an abstraction for 'skip' and 'take'
	const blockedUsers = await getUserBlocked(request.params.id, {
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
		filterIds,
		dateTarget,
		before,
		after,
		between,
		skip,
		take,
		sortBy,
		order,
	});

	const parsed = userArrayResponseSchema.parse(blockedUsers);
	return reply.code(200).send(parsed);
}

export async function blockUserHandler(
	request: FastifyRequest<{
		Params: { id: string };
		Body: blockUserInput;
	}>,
	reply: FastifyReply,
) {
	logger.debug({
		"event.action": "Block User",
		"id": request.params,
		"targetUserId": request.body,
		"message": "blockUserHandler hit",
	});
	const { id } = request.params;
	const { targetUserId } = request.body;

	const blocked = await blockUser(id, targetUserId);
	const parsed = userResponseSchema.parse(blocked);
	return reply.code(201).send(parsed);
}

export async function unblockUserHandler(
	request: FastifyRequest<{
		Params: { id: string; targetUserId: string };
	}>,
	reply: FastifyReply,
) {
	logger.debug({
		"event.action": "Unblock User",
		"id": request.params,
		"targetUserId": request.body,
		"message": "unblockUserHandler hit",
	});
	await unblockUser(request.params.id, request.params.targetUserId);
	return reply.code(204).send();
}
