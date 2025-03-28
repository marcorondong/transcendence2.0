import { FastifyRequest, FastifyReply } from "fastify";
import { createProduct, getProducts } from "./product.service";
import { createProductInput, createProductSchema, productResponseSchema, productArrayResponseSchema } from "./product.schema";

// MR_NOTE:
// With "parse" Zod will filter out fields not in the schema (e.g., salt, password).
// With safeParse is for adding an extra layer of security (since it comes from the user).

// TODO: Research from where all those these values are taken. From schema.prisma?
export async function createProductHandler(
	request: FastifyRequest<{ Body: createProductInput }>,
	reply: FastifyReply,
	) {
	// Serialize/validate/filter input via Zod schemas (createProductSchema.safeParse)
	// const result = createProductSchema.safeParse(request.body);
	// if (!result.success) {
	// 	return reply.code(400).send({
	// 		message: "Invalid request data",
	// 		errors: result.error.flatten(),
	// 	});
	// }
	try {
		const product = await createProduct({
			// ...result.data,
			...request.body,
			ownerId: request.user.id,
		});
		// Serialize/validate/filter input via Zod schemas (productResponseSchema.parse)
		const parsedProduct = productResponseSchema.parse(product);
		return reply.code(201).send(parsedProduct);
	} catch (e) {
		console.error("Create product failed:", e);
		return reply.code(500).send({ message: "Internal server error" });
	}
}

export async function getProductsHandler(request: FastifyRequest, reply: FastifyReply) {
	try {
		const products = await getProducts();
		// Serialize/validate/filter response via Zod schemas (productArrayResponseSchema.parse)
		const parsedProducts = productArrayResponseSchema.parse(products); // Zod serializes dates
		// MR_NOTE: This is for debugging
		// console.log("Actual response:", products);  // Logs raw data
		// console.log("Actual serialized response:", parsedProducts);
		return reply.code(200).send(parsedProducts);
	} catch (e) {
		console.error("Get products failed:", e);
		return reply.code(500).send({ message: "Internal server error" });
	}
}