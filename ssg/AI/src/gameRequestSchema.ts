
export const gameRequestSchema = {
  description: "Connect a new bot opponent to the pong game server",
  tags: ["Game"],
  summary: "Creates a bot instance for a game. The bot connects to the game room WebSocket to play.",
  body: {
	type: "object",
	required: ["host", "port", "side", "difficulty"],
	properties: {
	  host: { type: "string" },
	  port: { type: "string" },
	  side: { type: "string", enum: ["left", "right"] },
	  difficulty: { type: "string", enum: ["easy", "medium", "hard", "insane"] },
	  roomId: { type: "string" },
	},
  },
  response: {
	200: {
	  type: "object",
	  properties: {
		description: { type: "string" },
		gameRequest: {
		  type: "object",
		  properties: {
			host: { type: "string" },
			port: { type: "string" },
			side: { type: "string" },
			difficulty: { type: "string" },
			roomId: { type: "string" },
		  },
		},
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
	summary: "returns status 200 for a GET request so the scraper can stay quiet",
	body: {
	},
	response: {
	  200: {
		type: "object",
		properties: {
		  status: { type: "string" },
		},
	  },
	},
  };
  