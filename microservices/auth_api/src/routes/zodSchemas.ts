import { z } from "zod";

export const signInZodSchema = z.object({
	email: z.string().email(),
	password: z
	  .string()
	  .min(6, "Password must be at least 6 characters long")
	  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
	  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	  .regex(/\d/, "Password must contain at least one digit")
	  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one symbol"),
  }).strict();

export const successResponseSchema = z.object({
	success: z.boolean(),
}).strict();

export const payloadZodSchema = z.object({
	id: z.string().uuid(),
	nickname: z.string().min(1, "Nickname is required"),
  }).strict();

export type SignInInput = z.infer<typeof signInZodSchema>;