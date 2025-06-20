import { z, ZodTypeAny, ZodObject } from "zod";
import { userResponseSchema } from "../user/user.schema";

// TODO: Add later the `.describe()`

// Type definition for ordering (ascending/descending)
const sortDirections = ["asc", "desc"] as const;
export const sortDirectionEnum = z.enum(sortDirections); // TODO: Maybe I don't need to export this
export type SortDirection = (typeof sortDirections)[number];

const friendRequestFields = [
	"id",
	"fromId",
	"toId",
	"message",
	"createdAt",
] as const;
export const friendRequestSortByEnum = z.enum(friendRequestFields); // TODO: Maybe I don't need to export this
export type FriendRequestField = (typeof friendRequestFields)[number];

// Type definition to allow one field per query (used in )
export type UniqueFriendRequestField = { id: string };

// Type definition to allowing multiple User fields per query
export type FriendRequestQueryField = Partial<
	Record<FriendRequestField, string | Date>
>;

// Helper function to convert empty strings to undefined (Protection against invalid queries)
const blankToUndefined = <T extends z.ZodTypeAny>(
	schema: T,
): z.ZodEffects<z.ZodOptional<T>, z.infer<T> | undefined, unknown> =>
	z.preprocess((val) => {
		if (typeof val === "string" && val.trim() === "") return undefined;
		// Coerce booleans (since .preprocess() removes coercion)
		if (schema instanceof z.ZodBoolean) {
			if (val === "true") return true;
			if (val === "false") return false;
		}
		// Coerce numbers (since .preprocess() removes coercion)
		if (schema instanceof z.ZodNumber && typeof val === "string") {
			const num = Number(val);
			if (!isNaN(num)) return num;
		}
		return val;
	}, schema.optional());

// Helper function to recursively wrap all fields in an object schema with blankToUndefined()
const sanitizeQuerySchema = <T extends ZodObject<any>>(schema: T): T => {
	const shape = schema.shape;
	const newShape = Object.fromEntries(
		Object.entries(shape).map(([key, value]) => {
			// Handle nested object
			if (value instanceof z.ZodObject) {
				return [key, sanitizeQuerySchema(value)];
			}
			// Handle array of objects
			if (value instanceof z.ZodArray) {
				const inner = value._def.type;
				if (inner instanceof z.ZodObject) {
					const sanitizedInner = sanitizeQuerySchema(inner);
					return [key, z.array(sanitizedInner)];
				}
				// If not object, fallback to blankToUndefined on array itself
				return [key, blankToUndefined(value as ZodTypeAny)];
			}
			// Default: sanitize top-level field
			return [key, blankToUndefined(value as ZodTypeAny)];
		}),
	);
	return z.object(newShape) as T;
};

// Schema to create friend request
export const createFriendRequestSchema = z
	.object({
		fromId: z.string().uuid(),
		toId: z.string().uuid(),
		message: z.string().min(1).max(255),
	})
	.strict();

// Schema to get a friendRequest by ID
export const friendRequestIdParamSchema = z
	.object({
		id: z.string().uuid().describe("Friend Request ID"),
	})
	.strict();

// Schema for single friendRequest
export const friendRequestResponseSchema = z
	.object({
		id: z.string().uuid(),
		fromId: z.string().uuid(),
		from: userResponseSchema,
		toId: z.string().uuid(),
		to: userResponseSchema,
		message: z.string(),
		createdAt: z.date(),
	})
	.strict();

// Schema for array of friendRequest (for list responses)
export const friendRequestArrayResponseSchema = z.array(
	friendRequestResponseSchema,
);

const ARRAY_STRICT_MODE = false; // For toggling reject/allow single items in filterIds (it's an array, so there should be more than 1 item)

// Base schema for query parameters
// Note that all fields will be marked with '.optional()' and "coerced"
// by getFriendRequestsQuerySchema = sanitizeQuerySchema(baseGetFriendRequestsQuerySchema);
const baseGetFriendRequestsQuerySchema = z.object({
	id: z.string().uuid().describe("Find friend requests by ID"),
	filterIds: ARRAY_STRICT_MODE
		? z
				.array(z.string().uuid())
				.describe("Filter friend requests by UUIDs (array format)")
		: z
				.preprocess(
					(val) => (typeof val === "string" ? [val] : val),
					z.array(z.string().uuid()),
				)
				.describe(
					"Filter friend requests by UUIDs (supports single or multiple values)",
				),
	fromId: z.string().uuid().describe("Filter by sender user ID (fromId)"),
	toId: z.string().uuid().describe("Filter by recipient user ID (toId)"),
	message: z.string().describe("Filter by exact message content"),
	createdAt: z
		.preprocess((val) => new Date(val as string), z.date())
		.describe(
			"Filter friend requests by creation date (Remember to append 'Z' for UTC in fuzzy searches)",
		),
	before: z
		.preprocess((val) => new Date(val as string), z.date())
		.describe("Filter friend requests created before this date"),
	after: z
		.preprocess((val) => new Date(val as string), z.date())
		.describe("Filter friend requests created after this date"),
	between: z
		.preprocess(
			(val) =>
				Array.isArray(val)
					? val.map((d) => new Date(d as string))
					: undefined,
			z.tuple([
				z.date().describe("Start date (inclusive)"),
				z.date().describe("End date (inclusive)"),
			]),
		)
		.describe("Filter friend requests between two dates (inclusive)"),
	useFuzzy: z.boolean().describe("Enable fuzzy search on message field"),
	useOr: z.boolean().describe("Use OR instead of AND for combining filters"),
	skip: z.number().min(0).describe("Number of records to skip"),
	take: z.number().min(1).max(100).describe("Number of records to return"),
	page: z
		.number()
		.min(1)
		.describe("Page number to use for pagination (starts at 1)"),
	all: z.boolean().describe("If true, return all results without pagination"),
	sortBy: friendRequestSortByEnum,
	order: sortDirectionEnum,
});

// Refined schema for query parameters to find friend request
export const getFriendRequestsQuerySchema = sanitizeQuerySchema(
	baseGetFriendRequestsQuerySchema,
).strict(); // Rejects unknown fields

// Schema for empty response (when requesting DELETE so I return 204 No content (No content returned))
export const emptyResponseSchema = z
	// .void()
	.null()
	.describe("friend request deleted successfully");

export const errorResponseSchema = z.object({
	statusCode: z.number().describe("HTTP status code"),
	code: z.string().describe("Error string code"),
	message: z.string().describe("Detailed message about the error"),
	// Don't send these. Already printed in the terminal.
	// If I send them, I'm exposing internal code structure.
	// service: z.string().describe("Service that threw the error"),
	// type: z.string().describe("Error type/class"),
	// handler: z
	// 	.string()
	// 	.describe("Function that caught the error (handler function)"),
	// stack: z.string().describe("stack calls"),
	// nestedCause: z.any().describe("Original error object or nested AppError"),
});

// TypeScript types inferred from schemas
export type CreateFriendRequestInput = z.infer<
	typeof createFriendRequestSchema
>;
export type getFriendRequestsQuery = z.infer<
	typeof getFriendRequestsQuerySchema
>;
