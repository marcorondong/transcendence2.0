export const serverOption = {
	logger: {
		level: "warn",
		transport: {
			target: "pino-pretty",
			options: {
				colorize: true,
				ignore: "INFO",
				translateTime: "HH:MM:ss Z",
			},
		},
	},
};
