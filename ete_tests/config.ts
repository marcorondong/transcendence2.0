export interface ILogIn {
	username: string;
	password: string;
}

export const serverConfig = {
	port: 8080,
	ip: "localhost", // but can be 10.12.6.1 or whatever is remote host
	protocol: "https",
};

//TODO We need to register those user in order for game testing to work. Maybe even with testing case for registering
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
