import { FastifyInstance } from "fastify";
import { createProductHandler, getProductsHandler } from "./product.controller";
import { createProductSchema, productArrayResponseSchema, productResponseSchema } from "./product.schema";

async function productRoutes(server: FastifyInstance) {
	// This route IS authenticated
	// Expected response structure and status code for Fastify to validate responses (against Zod schemas).
	// to validate response structure matches schema (e.g., Fastify/Zod enforcement).
	server.post("/", {
		schema: {
			body: createProductSchema,
			response: { 201: productResponseSchema },
		},
	}, createProductHandler);

	// This route IS NOT authenticated
	server.get("/", {
		schema: {
			response: { 200: productArrayResponseSchema },
		},
		config: { authRequired: false },
	}, getProductsHandler);
}

export default productRoutes;