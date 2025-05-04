import {z} from "zod";

export const UserMoveSchema = z.object({
	move: z.enum(["up", "down"])
}).strict();

export type IncomingMove = z.infer<typeof UserMoveSchema>
