import { FastifyInstance } from "fastify";
import { createProductHandler, getProductsHandler } from "./product.controller";
import { createProductSchema, productArrayResponseSchema, productResponseSchema } from "./product.schema";

async function productRoutes(server: FastifyInstance) {
	// This route IS authenticated
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