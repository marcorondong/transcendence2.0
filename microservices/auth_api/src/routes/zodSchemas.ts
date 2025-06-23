import { z } from "zod";
import { env } from "../utils/env";

export const signInZodSchema = z.object({
	username: z.string(),
	password: z.string(),
});

export const signUpZodSchema = z.object({
	email: z.string(),
	password: z.string(),
	nickname: z.string(),
	username: z.string(),
});

export const profileZodSchema = z.object({
	nickname: z.string().optional(),
	email: z.string().optional(),
	password: z.string().optional(),
});

export const idZodSchema = z
	.object({
		id: z.string(),
	})
	.strict();

export const payloadZodSchema = z.object({
	id: z.string(),
	nickname: z.string(),
});

export const accessTokenZodSchema = z
	.object({
		[env.JWT_TOKEN_NAME]: z.string(),
	})
	.strict();

export type IdInput = z.infer<typeof idZodSchema>;
export type PayloadInput = z.infer<typeof payloadZodSchema>;
