interface BotConfig {
	email: string;
	password: string;
	name: string;
}

function validateEnvVariables(): BotConfig {
	const email = process.env.BOT_EMAIL;
	const password = process.env.BOT_PASSWORD;
	const name = process.env.BOT_NAME;

	if (!email) throw new Error("BOT_EMAIL environment variable is not set");
	if (!password)
		throw new Error("BOT_PASSWORD environment variable is not set");
	if (!name) throw new Error("BOT_NAME environment variable is not set");

	return {
		email,
		password,
		name,
	};
}

export const botConfig = validateEnvVariables();
