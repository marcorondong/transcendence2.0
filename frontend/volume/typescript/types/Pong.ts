export interface Pong {
	score?: Score;
	matchStatus: string;
	ball?: Ball;
	leftPaddle?: LeftPaddle;
	rightPaddle?: RightPaddle;
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

export interface LeftPaddle {
	x: number;
	y: number;
	height: number;
}

export interface RightPaddle {
	x: number;
	y: number;
	height: number;
}
