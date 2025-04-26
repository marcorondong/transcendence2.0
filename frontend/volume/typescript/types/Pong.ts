export interface Pong {
	score?: Score;
	matchStatus: string;
	ball?: Ball;
	leftPaddle?: Paddle;
	rightPaddle?: Paddle;
	roomId: string;
	knockoutName?: string;
}

export interface Score {
	leftGoals: number;
	rightGoals: number;
	time: number;
}

export interface Ball {
	x: number;
	y: number;
	radius: number;
}

export interface Paddle {
	x: number;
	y: number;
	height: number;
}
