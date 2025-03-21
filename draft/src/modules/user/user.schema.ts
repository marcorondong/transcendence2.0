import { z } from 'zod';
// import { FastifyTypeProviderZod } from 'fastify-type-provider-zod';

const userCore = {
	email: z.string({
		required_error: 'Email is required',
		invalid_type_error: 'Email must be a string',
		}).email(),
	name: z.string().min(2),
}

export const createUserSchema = z.object({
	...userCore,
	password: z.string({
		required_error: 'Password is required',
		invalid_type_error: 'Password must be a string',
	}).min(6),
});

export const createUserResponseSchema = z.object({
	id: z.string(),
	...userCore,
});

export const loginSchema = z.object({
	email: z.string({
		required_error: 'Email is required',
		invalid_type_error: 'Email must be a string',
	}).email(),
	password: z.string({
		required_error: 'Password is required',
		invalid_type_error: 'Password must be a string',
	}).min(6),
});

export const loginResponseSchema = z.object({
	accessToken: z.string(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type loginInput = z.infer<typeof loginSchema>;

// export const userSchemas = {
// 	createUserSchema: createUserSchema,
// 	createUserResponseSchema: createUserResponseSchema,
// };