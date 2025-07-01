export interface ILogIn {
	username: string;
	password: string;
}

export interface IUserInfo extends ILogIn {
	nickname: string;
	email: string;
}

export const serverConfig = {
	port: 443,
	ip: "localhost", // but can be 10.12.6.1 or whatever is remote host
	protocol: "https",
};

export const registeredUsers = {
	user1: {
		email: "f@gmail.com",
		nickname: "sekula",
		username: "fseles",
		password: "Pong123!",
	},
	user2: {
		email: "j@gmail.com",
		nickname: "jasa",
		username: "selki",
		password: "Pong123!",
	},
	user3: {
		email: "shakira@gmail.com",
		nickname: "shaq",
		username: "shakira",
		password: "Pong123!",
	},
	user4: {
		email: "alexandra@gmail.com",
		nickname: "aca",
		username: "alex",
		password: "Pong123!",
	},
	user5: {
		email: "sandra@gmail.com",
		nickname: "seka",
		username: "sindra",
		password: "Pong123!",
	},
	user6: {
		email: "snjezana@gmail.com",
		nickname: "snjeza",
		username: "sisi",
		password: "Pong123!",
	},
	user7: {
		email: "dragana@gmail.com",
		nickname: "didi",
		username: "dmsat",
		password: "Pong123!",
	},
	user8: {
		email: "severina@gmail.com",
		nickname: "seve",
		username: "stikla",
		password: "Pong123!",
	},
	user9: {
		email: "jelena@gmail.com",
		nickname: "jelka",
		username: "jele",
		password: "Pong123!",
	},
	user10: {
		email: "mimimercedes@gmail.com",
		nickname: "mimi",
		username: "mercedes",
		password: "Pong123!",
	},
	user11: {
		email: "dorisdragovic@gmail.com",
		nickname: "doris",
		username: "ljubemoja",
		password: "Pong123!",
	},
	user12: {
		email: "afrika@gmail.com",
		nickname: "paprika",
		username: "vrhnje",
		password: "Pong123!",
	},
	user13: {
		email: "u4@gmail.com",
		nickname: "vlak",
		username: "voz",
		password: "Pong123!",
	},
	user14: {
		email: "u6@gmail.com",
		nickname: "bahn",
		username: "cucu",
		password: "Pong123!",
	},
	user15: {
		email: "ivona@gmail.com",
		nickname: "iva",
		username: "siva",
		password: "Pong123!",
	},
	user16: {
		email: "slatkica@gmail.com",
		nickname: "secer",
		username: "mali",
		password: "Pong123!",
	},
};

export const homeUrl = `${serverConfig.protocol}://${serverConfig.ip}:${serverConfig.port}`;

export const registerUrl = `${homeUrl}/auth-api/sign-up`;
