export interface User {
	id: string;
	createdAt: string;
	updatedAt: string;
	username: string;
	email: string;
	nickname: string;
}

export interface UserAuth {
	username: string;
	password: string;
}

export interface ProfileAuth extends UserAuth {
	nickname: string;
	email: string;
}

export interface MatchHistory {
	winnerId: string;
	loserId: string;
	winnerScore: number;
	loserScore: number;
	createdAt: Date;
}
