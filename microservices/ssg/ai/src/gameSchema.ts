export const gameRequestSchema = {
	description: "Connect a new bot opponent to the pong game server",
	tags: ["Game vs mandatory AI"],
	summary: "The bot moves at the one speed required by subject",
	body: {
		type: "object",
		properties: {
			difficulty: {
				type: "string",
				enum: ["easy", "normal", "hard"],
				default: "normal",
			},
			mode: {
				type: "string",
				default: "mandatory",
			},
			roomId: { type: "string" },
		},
		required: ["roomId"],
	},
	response: {
		200: {
			type: "object",
			properties: {
				description: { type: "string" },
			},
		},
		400: {
			type: "object",
			properties: {
				error: { type: "string" },
			},
		},
		500: {
			type: "object",
			properties: {
				error: { type: "string" },
			},
		},
	},
};

export const healthSchema = {
	description: "endpoint for blackbox scraper",
	tags: ["health"],
	summary:
		"returns status 200 for a GET request so the scraper can stay quiet",
	response: {
		200: {
			type: "object",
			properties: {
				status: { type: "string" },
			},
			required: ["status"],
		},
	},
};
