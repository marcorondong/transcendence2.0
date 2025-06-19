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
	addFriendSchema, // TODO: Check if I use these
	targetUserIdParamSchema,
	userIdParamSchema,
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
	logger.info("testing logger in registerUserHandler");
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
	logger.warn("testing logger in loginHandler");
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
	logger.error("testing logger in getUserHandler");
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
	logger.debug("testing logger in getUsersHandler");
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
	logger.fatal("testing logger in deleteUserHandler");
	const user = await findUserByUnique({ id: request.params.id });

	const uploadsBase = path.resolve("uploads/users");
	const userFolder = path.join(uploadsBase, user.username);

	// Remove user folder here in controller, since service (should basically) handles database operations;
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
	logger.log("testing logger in putUserHandler");
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
	logger.from(request).info("testing logger in patchUserHandler");
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
	logger
		.from(request)
		.info({ "event.action": "pictureHandler" }, "Update user picture");
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
	console.log("Saving picture to:", userFolder); // TODO: Remove this later
	await fs.promises.mkdir(userFolder, { recursive: true });
	// console.log(`Would run: mkdir(${userFolder}, { recursive: true })`);

	// Delete all files in the user's folder (remove old pictures)
	const oldFiles = await fs.promises.readdir(userFolder);
	for (const file of oldFiles) {
		await fs.promises.unlink(path.join(userFolder, file));
	}

	// Save new picture
	const filePath = path.join(userFolder, `picture.${ext}`);
	await pipeline(pictureFile.file, fs.createWriteStream(filePath));
	// console.log(
	// 	`Would run: pipeline(<picture stream>, createWriteStream(${filePath}))`,
	// );

	// Store relative path in DB
	const publicPath = `/uploads/users/${user.username}/picture.${ext}`;
	const updatedUser = await updateUserPicture(user.id, publicPath);

	reply.code(200).send(updatedUser); // TODO: Should I parse here?
}

export async function getFriendsHandler(
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply,
) {
	const friends = await getUserFriends(request.params.id);
	return reply.code(200).send(friends); // TODO: Should I parse here?
}

export async function addFriendHandler(
	request: FastifyRequest<{
		Params: { id: string };
		Body: addFriendInput;
	}>,
	reply: FastifyReply,
) {
	await addFriend(request.params.id, request.body.targetUserId);
	const friends = await getUserFriends(request.params.id);
	return reply.code(201).send(friends); // TODO: Should I parse here?
}

// TODO: Should I still return the updated friends array, or 204 instead?
export async function deleteFriendHandler(
	request: FastifyRequest<{
		Params: { id: string; targetUserId: string };
	}>,
	reply: FastifyReply,
) {
	await deleteFriend(request.params.id, request.params.targetUserId);
	const friends = await getUserFriends(request.params.id);
	return reply.code(200).send(friends); // TODO: Should I parse here?
}
