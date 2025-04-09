export const swaggerOptions = {
	swagger: {
		info: {
			title: "Chat API",
			description: "API Documentation with Fastify and Swagger",
			version: "1.0.0",
		},
		host: "localhost:3002",
		schemes: ["http"],
		consumes: ["application/json"],
		produces: ["application/json"],
		// components: {
		// 	securitySchemes: {
		// 		bearerAuth: {
		// 			type: "http",
		// 			scheme: "bearer",
		// 			bearerFormat: "JWT",
		// 			description: "JWT authorization header",
		// 		},
		// 	},
		// },
		// security: [
		// 	{
		// 		bearerAuth: [],
		// 	},
		// ],
	},
};

export const swaggerUiOptions = {
	routePrefix: "/documentation",
};
