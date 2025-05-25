import { recordGameOnBlockchain } from "./recordGame";

export class BlockchainData {
	private readonly gameId: string;
	private readonly tournamentId: string;
	private readonly stageName: string;
	private readonly player1: string;
	private readonly player2: string;
	private readonly score1: number;
	private readonly score2: number;

	constructor(
		gameId: string,
		tournamentId: string,
		stageName: string,
		player1: string,
		player2: string,
		score1: number,
		score2: number,
	) {
		this.gameId = gameId;
		this.tournamentId = tournamentId;
		this.stageName = stageName;
		this.player1 = player1;
		this.player2 = player2;
		this.score1 = score1;
		this.score2 = score2;
	}

	async putOnBlockchain() {
		await recordGameOnBlockchain(
			this.gameId,
			this.tournamentId,
			this.stageName,
			this.player1,
			this.player2,
			this.score1,
			this.score2,
		);
	}
}
