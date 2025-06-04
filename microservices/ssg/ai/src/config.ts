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

function parseTokenRoute(): string {
	const tokenRoute = process.env.AUTH_API_BOT_JWT_END_POINT;

	if (!tokenRoute)
		throw new Error(
			"AUTH_API_BOT_JWT_END_POINT environment variable is not set",
		);

	return tokenRoute;
}

export const tokenRoute = parseTokenRoute();

interface PaddleTwistSelector {
	[difficulty: string]: number;
}

//the AI will twist the ball. maximum twist = 0.5 a.k.a. half of paddle height
export const paddleTwistSelector: PaddleTwistSelector = {
	easy: 0.5,
	normal: 0.25,
	hard: 0,
};
