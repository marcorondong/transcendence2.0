import { z } from "zod";

export const signInZodSchema = z
	.object({
		email: z.string().email("Invalid email format"),
		password: z
			.string()
			.min(6, "Password must be at least 6 characters long")
			.regex(
				/[a-z]/,
				"Password must contain at least one lowercase letter",
			)
			.regex(
				/[A-Z]/,
				"Password must contain at least one uppercase letter",
			)
			.regex(/\d/, "Password must contain at least one digit")
			.regex(/[^a-zA-Z0-9]/, "Password must contain at least one symbol"),
	})
	.strict();

export const successResponseSchema = z
	.object({
		success: z.boolean(),
	})
	.strict();

export const payloadZodSchema = z
	.object({
		id: z.string().uuid("Invalid UUID format"),
		nickname: z
			.string()
			.min(3, "Name must be at least 3 characters long")
			.regex(/\S/, "Name must not be empty or whitespace only")
			.regex(/\D/, "Name must not be numbers only")
			.regex(/[a-zA-Z]/, "Name must contain at least one letter"),
	})
	.strict();

export type SignInInput = z.infer<typeof signInZodSchema>;
