import { FastifyRequest, FastifyReply } from "fastify";
import {
	createProductInput,
	productResponseSchema,
	productArrayResponseSchema,
} from "./product.schema";
import { createProduct, getProducts } from "./product.service";
import { AppError, PRODUCT_ERRORS } from "../../utils/errors";

// MR_NOTE:
// With "parse" Zod will filter out fields not in the schema (e.g., salt, password).
// With safeParse is for adding an extra layer of security (since it comes from the user).

export async function createProductHandler(
	request: FastifyRequest<{ Body: createProductInput }>,
	reply: FastifyReply,
) {
	const product = await createProduct({
		...request.body,
		ownerId: request.user.id,
	});
	// Serialize/validate/filter input via Zod schemas (productResponseSchema.parse)
	const parsedProduct = productResponseSchema.parse(product);
	return reply.code(201).send(parsedProduct);
}

// MR_NOTE: '_' replace "request" (used when parameter is not used)
export async function getProductsHandler(
	_: FastifyRequest,
	reply: FastifyReply,
) {
	const products = await getProducts();
	// Serialize/validate/filter response via Zod schemas (productArrayResponseSchema.parse)
	const parsedProducts = productArrayResponseSchema.parse(products); // Zod serializes dates
	// MR_NOTE: This is for debugging
	// console.log("Actual response:", products);  // Logs raw data
	// console.log("Actual serialized response:", parsedProducts);
	return reply.code(200).send(parsedProducts);
}
