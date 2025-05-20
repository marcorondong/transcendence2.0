export interface Score {
	leftTeam: { goals: number; teamNickname: string };
	rightTeam: { goals: number; teamNickname: string };
	time: number;
}

export interface GameState {
	score: Score;
	ball: { x: number; y: number; radius: number };
	leftPaddle: { x: number; y: number; height: number };
	rightPaddle: { x: number; y: number; height: number };
	roomId: string;
	knockoutName: string;
}

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

interface BotSpeedSelector {
	[difficulty: string]: number;
}

//difficulty number = delay between AI moves in ms
export const botSpeedSelector: BotSpeedSelector = {
	easy: 1000 / 60,
	normal: 8,
	hard: 0,
};

interface PaddleTwistSelector {
	[difficulty: string]: number;
}

//the AI will twist the ball. maximum twist = 0.5 a.k.a. half of paddle height
export const paddleTwistSelector: PaddleTwistSelector = {
	easy: 0,
	normal: 0.25,
	hard: 0.4,
};
