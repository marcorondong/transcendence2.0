const pongPlainHttp = "HTTP ENDPOINT";

export class PongSwagger {
	static getSwaggerOptions() {
		return {
			openapi: {
				info: {
					title: "Pong api",
					description: "Pong api documentation",
					version: `1.0.0`,
				},
				servers: [
					{
						url: "http://localhost:3010",
						description: "Local server for pong api",
					},
				],
			},
		};
	}

	static getHealthCheckSchema() {
		return {
			description: "health check route",
			tags: [pongPlainHttp],
			response: {
				200: {
					type: "object",
					properties: {
						message: { type: "string" },
					},
				},
			},
		};
	}

	static getPlayerRoomSchema() {
		return {
			description: "Player room route",
			tags: [pongPlainHttp],
			response: {
				200: {
					type: "object",
					properties: {
						roomId: { type: "string" },
					},
				},
				404: {
					type: "object",
					properties: {
						success: { type: "boolean" },
					},
				},
			},
		};
	}

	static getBlockchainSchema() {
		return {
			description: "Route for fetching log from blockchain",
			tags: ["Blockchain"],
			response: {
				200: {
					type: "object",
					properties: {
						message: { type: "string" },
						record: { type: "string" },
						log: { type: "string" },
					},
				},
				404: {
					type: "object",
					properties: {
						message: { type: "string" },
					},
				},
			},
		};
	}

	static getWebsocketSchema() {
		return {
			//hide: true, //TODO add this line later to hide if from swagger
			description: "Websockets are not supported by Swagger",
			tags: ["Websockets"],
		};
	}
}
