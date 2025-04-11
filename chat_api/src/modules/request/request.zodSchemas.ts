import { z } from "zod";

export const requestZodSchema = z.object({
	userName: z.string(),
	friendName: z.string(),
});

export type RequestInput = z.infer<typeof requestZodSchema>;
