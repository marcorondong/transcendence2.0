import { z } from "zod";

// const passwordZodSchema = z
// 	.string()
// 	.min(6, "Password must be at least 6 characters long")
// 	.max(128, "Password must be at most 100 characters long")
// 	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
// 	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
// 	.regex(/\d/, "Password must contain at least one digit")
// 	.regex(/[^a-zA-Z0-9]/, "Password must contain at least one symbol");

// const emailZodSchema = z
// 	.string()
// 	.email("Invalid email format")
// 	.min(6, "Email must be at least 6 characters long")
// 	.max(254, "Email must be at most 254 characters long")
// 	.refine((email) => {
// 		const [local, domain] = email.split("@");
// 		if (!local || !domain) return false;
// 		if (local.length > 64 || local.length < 1) return false;
// 		if (domain.length < 3) return false;
// 		return true;
// 	});

// const nicknameZodSchema = z
// 	.string()
// 	.min(3, "Nickname must be at least 3 characters long")
// 	.max(30, "Nickname must be at most 30 characters long")
// 	.regex(/\S/, "Nickname must not be empty or whitespace only")
// 	.regex(/\D/, "Nickname must not be numbers only")
// 	.regex(/[a-zA-Z]/, "Nickname must contain at least one letter");

// const usernameZodSchema = z
// 	.string()
// 	.min(3, "Username must be at least 3 characters long")
// 	.max(30, "Username must be at most 30 characters long")
// 	.regex(/\S/, "Username must not be empty or whitespace only")
// 	.regex(/\D/, "Username must not be numbers only")
// 	.regex(/[a-zA-Z]/, "Username must contain at least one letter");

// const idZodSchema = z.string().uuid("Invalid UUID format");

// const successZodSchema = z.boolean();

// export const successResponseSchema = z
// 	.object({
// 		success: successZodSchema,
// 	})
// 	.strict();

export const signInZodSchema = z
	.object({
		username: z.string(),
		password: z.string(),
	})
	.strict();

export const signUpZodSchema = z
	.object({
		email: z.string(),
		password: z.string(),
		nickname: z.string(),
		username: z.string(),
	})
	.strict();


export const payloadZodSchema = z.object({
	id: z.string(),
	nickname: z.string(),
});

export type SignInInput = z.infer<typeof signInZodSchema>;
export type SignUpInput = z.infer<typeof signUpZodSchema>;
