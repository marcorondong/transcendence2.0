import { FastifyRequest, FastifyReply } from "fastify";
import { createProduct, getProducts } from "./product.service";
import { createProductInput, productResponseSchema, productArrayResponseSchema } from "./product.schema";
import { AppError } from "../../utils/errors";

// MR_NOTE:
// With "parse" Zod will filter out fields not in the schema (e.g., salt, password).
// With safeParse is for adding an extra layer of security (since it comes from the user).

export async function createProductHandler(
	request: FastifyRequest<{ Body: createProductInput }>,
	reply: FastifyReply,
	) {
	try {
		const product = await createProduct({
			...request.body,
			ownerId: request.user.id,
		});
		// Serialize/validate/filter input via Zod schemas (productResponseSchema.parse)
		const parsedProduct = productResponseSchema.parse(product);
		return reply.code(201).send(parsedProduct);
	} catch (e) {
		console.error("Create product failed:", e);
		if (e instanceof AppError) {
			return reply.code(e.statusCode).send({ message: e.message });
		}
		// TODO: Maybe add a throw here to reach the global error handler?
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