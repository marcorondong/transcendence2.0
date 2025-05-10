import { literal, z } from "zod";
import { tournamentConfig } from "../config";

//schema is a blueprint or definition of what
// data should look like. It is used to validate data at runtime
//z. infer is Typescript utility to derive the Typescript type from Zod schema.

export const UserMoveSchema = z
	.object({
		move: z.enum(["up", "down"]),
	})
	.strict();

export type IncomingMove = z.infer<typeof UserMoveSchema>;
const validSizeLiterals = tournamentConfig.valid_sizes.map((size) =>
	z.literal(size),
);

const TournamentSizeSchema = z.union(
	validSizeLiterals as [
		(typeof validSizeLiterals)[0],
		(typeof validSizeLiterals)[1],
		...z.ZodLiteral<number>[],
	],
);

export const gameRoomSchema = z.object({
	roomId: z.string().uuid().or(z.literal("private")),
	clientType: z.enum(["player", "spectator"]),
	matchType: z.enum(["singles", "tournament", "doubles"]),
	tournamentSize: TournamentSizeSchema,
});

const RoomIdSchema = z.union([
	z.string().uuid(),
	z.literal("private"),
	z.literal("public"),
]);

export type RoomIdType = z.infer<typeof RoomIdSchema>;

export const HeadToHeadQuerySchema = z
	.object({
		roomId: RoomIdSchema.default("public"),
	})
	.strict();

export type HeadToHeadQuery = z.infer<typeof HeadToHeadQuerySchema>;

//port type
