import { z } from "zod"
import { zodToJsonSchema } from "zod-to-json-schema"; // MR_NOTE: This is for previewing the final JSON schema Fastify sees.

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

// MR_NOTE: This is for previewing the final JSON schema Fastify sees.
const jsonSchema = zodToJsonSchema(z.array(productResponseSchema), "ProductsArray");
console.log("Expected JSON Schema:", JSON.stringify(jsonSchema, null, 2));


// TODO: Tutorial has it as "productsResponseSchema"
export const productArrayResponseSchema = z.array(productResponseSchema);

export type createProductInput = z.infer<typeof createProductSchema>;