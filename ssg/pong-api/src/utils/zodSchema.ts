import {literal, z} from "zod";
import { tournamentConfig } from "../config";

export const UserMoveSchema = z.object({
	move: z.enum(["up", "down"])
}).strict();

export type IncomingMove = z.infer<typeof UserMoveSchema>
const validSizeLiterals = tournamentConfig.valid_sizes.map((size) => z.literal(size))

const TournamentSizeSchema = z.union(
	validSizeLiterals as [typeof validSizeLiterals[0], typeof validSizeLiterals[1], ...z.ZodLiteral<number>[]]
);

export const gameRoomSchema = z.object({
	roomId: z.string().uuid().or(z.literal("private")),
	clientType: z.enum(["player", "spectator"]),
	matchType: z.enum(["singles", "tournament", "doubles"]),
	tournamentSize: TournamentSizeSchema
})
