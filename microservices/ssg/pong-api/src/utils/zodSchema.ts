import { literal, z } from "zod";
import { tournamentConfig } from "../config";

// ==============================
// Incoming move
// ==============================
export const UserMoveSchema = z
	.object({
		move: z.enum(["up", "down"]),
	})
	.strict();
export type IncomingMove = z.infer<typeof UserMoveSchema>;

// ==============================
// Tournament Query
// ==============================
const literals = tournamentConfig.valid_sizes.map((size) => z.literal(size));
if (literals.length < 2) {
	throw new Error(
		"Tournament size schema wants at least two values for whatever reason",
	);
}

export const TournamentSizeSchema = z.union(
	literals as [
		z.ZodLiteral<number>,
		z.ZodLiteral<number>,
		...z.ZodLiteral<number>[],
	],
);
export type TournamentSize = z.infer<typeof TournamentSizeSchema>;

export const TournamentSizeQuerySchema = z
	.object({
		tournamentSize: z
			.string()
			.transform((val, ctx) => {
				const parsed = Number(val);
				if (Number.isNaN(parsed)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "tournamentSize must be a number",
					});
					return z.NEVER;
				}
				return parsed;
			})
			.refine((val) => tournamentConfig.valid_sizes.includes(val), {
				message: "Invalid tournament size",
			})
			.default(String(tournamentConfig.default_size)), // default must be a string here
	})
	.strict();

export type TournamentSizeQuery = z.infer<typeof TournamentSizeQuerySchema>;

// ==============================
// Head to Head query
// ==============================
const RoomIdSchema = z.union([
	z.string().uuid(),
	z.literal("private"),
	z.literal("public"), //read from config to make it better later
]);
export type RoomIdType = z.infer<typeof RoomIdSchema>;

export const HeadToHeadQuerySchema = z
	.object({
		roomId: RoomIdSchema.default("public"),
	})
	.strict();

export type HeadToHeadQuery = z.infer<typeof HeadToHeadQuerySchema>;
