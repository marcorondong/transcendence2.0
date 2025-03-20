import { FastifyRequest } from "fastify";
import { createProduct, getProducts } from "./product.service";
import { createProductInput } from "./product.schema";

// TODO: Research from where all those these values are taken. From schema.prisma?
export async function createProductHandler(
	request: FastifyRequest<{
		Body: createProductInput;
	}>,
	) {
	const product = await createProduct({
		...request.body,
		ownerId: request.user.id,
	});
	return product;
}

export async function getProductsHandler() {
	const products = await getProducts();
	// MR_NOTE: This is for debugging
	// console.log("Actual response:", products);  // Logs raw data
	return products;
}