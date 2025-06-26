export interface ILogIn {
	username: string;
	password: string;
}

export interface IUserInfo extends ILogIn {
	nickname: string;
	email: string;
}

export const serverConfig = {
	port: 8080,
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
};

export const homeUrl = `${serverConfig.protocol}://${serverConfig.ip}:${serverConfig.port}`;

export const registerUrl = `${homeUrl}/auth-api/sign-up`;
