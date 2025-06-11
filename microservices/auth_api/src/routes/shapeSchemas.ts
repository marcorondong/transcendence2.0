// TODO delete in production, these are just for swagger
export const signInBodyShape = {
	type: "object",
	properties: {
		username: { type: "string" },
		password: { type: "string" },
	},
};

// TODO delete in production, these are just for swagger
export const signUpBodyShape = {
	type: "object",
	properties: {
		email: { type: "string" },
		password: { type: "string" },
		nickname: { type: "string" },
		username: { type: "string" },
	},
};

// TODO delete in production, these are just for swagger
export const profileBodyShape = {
	type: "object",
	properties: {
		nickname: { type: "string" },
		email: { type: "string" },
		password: { type: "string" },
	},
};

export const idParamShape = {
	type: "object",
	properties: {
		id: { type: "string" },
	},
	required: ["id"],
};

export const payloadResponseShape = {
	type: "object",
	properties: {
		id: { type: "string" },
		nickname: { type: "string" },
	},
	required: ["id", "nickname"],
};

export const accessTokenResponseShape = {
	type: "object",
	properties: {
		access_token: { type: "string" },
	},
	required: ["access_token"],
};