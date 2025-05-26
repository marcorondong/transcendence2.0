export const signInBodyShape = {
	type: "object",
	properties: {
		username: { type: "string" },
		password: { type: "string" },
	},
};

export const signUpBodyShape = {
	type: "object",
	properties: {
		email: { type: "string" },
		password: { type: "string" },
		nickname: { type: "string" },
		username: { type: "string" },
	},
};

export const payloadResponseShape = {
	type: "object",
	properties: {
		id: { type: "string" },
		nickname: { type: "string" },
	},
	required: ["id", "nickname"],
};
