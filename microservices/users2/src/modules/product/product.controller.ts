import { FastifyRequest, FastifyReply } from "fastify";
import { createProduct, getProducts } from "./product.service";
import { createProductInput, createProductSchema, productResponseSchema, productArrayResponseSchema } from "./product.schema";

// MR_NOTE:
// With "parse" Zod will filter out fields not in the schema (e.g., salt, password).
// With safeParse is for adding an extra layer of security (since it comes from the user).

// TODO: Research from where all those these values are taken. From schema.prisma?
// TODO: Should I also use try/catch?
// MR_Note: Old function which didnt use automatic Zod for validation/serialization.
// export async function createProductHandler(
// 	request: FastifyRequest<{
// 		Body: createProductInput;
// 	}>,
// 	) {
// 	const product = await createProduct({
// 		...request.body,
// 		ownerId: request.user.id,
// 	});
// 	return product;
// }

export async function createProductHandler(
	request: FastifyRequest,
	reply: FastifyReply,
	) {
	// Serialize/validate/filter input via Zod schemas (createProductSchema.safeParse)
	const result = createProductSchema.safeParse(request.body);
	if (!result.success) {
		// return reply.code(400).send({ error: result.error.format() });
		// // TODO: For what is "format"?
		return reply.code(400).send({
			message: "Invalid request data",
			errors: result.error.flatten(),
		});
	}
	try {
		const product = await createProduct({
			...result.data,
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

// MR_Note: Old function which didnt use automatic Zod for validation/serialization.
// export async function getProductsHandler() {
// 	const products = await getProducts();
// 	// MR_NOTE: This is for debugging
// 	// console.log("Actual response:", products);  // Logs raw data
// 	// return products;
// 	// TODO: Add serialization logic in "service" file
// 	const serialized = products.map(product => ({
// 		...product,
// 		createdAt: product.createdAt.toISOString(),
// 		updatedAt: product.updatedAt.toISOString(),
// 	}));
// 	console.log("Actual serialized response:", serialized);
// 	return serialized;
// }

export async function getProductsHandler(request: FastifyRequest, reply: FastifyReply) {
	// MR_NOTE: This is for debugging
	// console.log("Actual response:", products);  // Logs raw data
	// return products;
	// TODO: Add serialization logic in "service" file
	try {
		const products = await getProducts();
		// return productArrayResponseSchema.parse(products); // Zod serializes dates
		// Serialize/validate/filter response via Zod schemas (productArrayResponseSchema.parse)
		const parsedProducts = productArrayResponseSchema.parse(products); // Zod serializes dates
		return reply.code(200).send(parsedProducts);
	} catch (e) {
		console.error("Get products failed:", e);
		return reply.code(500).send({ message: "Internal server error" });
	}
}