export interface User {
	id: string;
	createdAt: string;
	updatedAt: string;
	picture: string;
	username: string;
	email: string;
	nickname: string;
}

export interface UserAuth {
	username: string;
	password: string;
}

export interface UserPut {
	nickname?: string;
	password?: string;
	email?: string;
}

export interface MatchHistory {
	winnerId: string;
	loserId: string;
	winnerScore: number;
	loserScore: number;
	createdAt: Date;
}

export interface UserAggregated extends User {
	wins: number;
	losses: number;
	online: boolean;
}
