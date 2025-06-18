export interface ILogIn {
	username: string;
	password: string;
}

export const serverConfig = {
	port: 8080,
	ip: "localhost", // but can be 10.12.6.1 or whatever is remote host
	protocol: "https",
};

export const registeredUsers = {
	user1: {
		username: "fseles",
		password: "Pong123!",
	},
	user2: {
		username: "jasa",
		password: "Pong123!",
	},
};

export const homeUrl = `${serverConfig.protocol}://${serverConfig.ip}:${serverConfig.port}`;
