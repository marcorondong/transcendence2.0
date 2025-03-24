import { FastifyInstance } from "fastify";
import { createProductHandler, getProductsHandler } from "./product.controller";
import { createProductSchema, productArrayResponseSchema, productResponseSchema } from "./product.schema";

async function productRoutes(server: FastifyInstance) {
	// MR_NOTE: I should do this if I haven't enabled Zod globally
	// const app = server.withTypeProvider<ZodTypeProvider>();
	// OR: server.withTypeProvider<ZodTypeProvider>().post("/", {...});
	// The function definition is this: server.get(path, options, handler); (3 arguments)
	// Expected response structure and status code for Fastify to validate responses (against Zod schemas).
	// to validate response structure matches schema (e.g., Fastify/Zod enforcement).
	// This route IS authenticated because it doesnt have "config: { authRequired: false },"
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