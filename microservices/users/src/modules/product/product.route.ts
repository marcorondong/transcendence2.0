import { FastifyInstance } from "fastify";
import { createProductHandler, getProductsHandler } from "./product.controller";
import {
	createProductSchema,
	productArrayResponseSchema,
	productResponseSchema,
} from "./product.schema";

// MR_NOTE:
// The functions definition is this: server.get(path, options, handler); (3 arguments)
// Expected response structure and status code for Fastify to validate responses (against Zod schemas).
// To validate request/response structure must match schema (Fastify/Zod enforcement).

async function productRoutes(server: FastifyInstance) {
	// This route IS authenticated because it doesn't have "config: { authRequired: false },"
	server.post(
		"/",
		{
			schema: {
				body: createProductSchema,
				response: { 201: productResponseSchema },
			},
		},
		createProductHandler,
	);
	server.get(
		"/",
		{
			schema: {
				response: { 200: productArrayResponseSchema },
			},
			// Remove authentication (this route is public)
			config: { authRequired: false },
		},
		getProductsHandler,
	);
}

export default productRoutes;
