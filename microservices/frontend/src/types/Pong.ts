export interface Pong {
	score?: Score;
	matchStatus: string;
	ball?: Ball;
	leftPaddle?: Paddle;
	leftSecondPaddle?: Paddle;
	rightPaddle?: Paddle;
	rightSecondPaddle?: Paddle;
	roomId: string;
	knockoutName?: string;
}

interface ITeamScore {
	goals: number;
	teamNickname: string;
}

export interface Score {
	leftTeam: ITeamScore;
	rightTeam: ITeamScore;
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

export interface Stats {
	userId: string;
	total: number;
	wins: number;
	losses: number;
}
