import { z } from "zod";
// import { zodToJsonSchema } from "zod-to-json-schema"; // MR_NOTE: This is for debugging (Previewing the final JSON schema Fastify sees)

// MR_NOTE: In Zod, everything is required by default.

// TODO: Rename it to "newProduct"
const productInput = {
	title: z.string(),
	price: z.number(),
	content: z.string().optional(),
};

// TODO: Rename it to "existingProduct" or "product"
const productGenerated = {
	id: z.number(),
	createdAt: z.date(),
	updatedAt: z.date(),
};

export const createProductSchema = z.object({
	...productInput,
});

export const productResponseSchema = z.object({
	...productInput,
	...productGenerated,
});

// MR_NOTE: This is for debugging (Previewing the final JSON schema Fastify sees)
// const jsonSchema = zodToJsonSchema(z.array(productResponseSchema), "ProductsArray");
// console.log("Expected JSON Schema:", JSON.stringify(jsonSchema, null, 2));

// Schema for array of products (for list responses)
export const productArrayResponseSchema = z.array(productResponseSchema);

// TypeScript types inferred from schemas
export type createProductInput = z.infer<typeof createProductSchema>;
