import { z } from "zod"

// TODO: Rename it to "newProduct"
const productInput = {
	title: z.string(),
	price: z.number(),
	content: z.string().optional(),
}

// TODO: Rename it to "existingProduct" or "product"
const productGenerated = {
	id: z.number(),
	createdAt: z.string(),
	updatedAt: z.string(),
}

export const createProductSchema = z.object({
	...productInput,
})

export const productResponseSchema = z.object({
	...productInput,
	...productGenerated,
})

// TODO: Tutorial has it as "productsResponseSchema"
export const productArrayResponseSchema = z.array(productResponseSchema);

export type createProductInput = z.infer<typeof createProductSchema>;