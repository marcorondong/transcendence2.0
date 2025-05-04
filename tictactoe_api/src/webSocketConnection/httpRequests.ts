import { statsSchema } from "./zodSchema";

export async function postResult(player: string, opponent: string, playerSign: string) {
	try {
		const data = {
			playerXId: player,
			playerOId: opponent,
			result: playerSign,
		  };
		const response = await fetch("http://tictactoe_db_container:3003/tictactoe/create-game", {
			method: 'POST',
			headers: {
			'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			throw new Error(`Request failed with status ${response.status}`);
		}
	} catch (error) {
		console.error("Error posting result:", error);
		throw error;
	}
}

export async function getHeadToHeadStats(player: string, opponent: string) {
	const data = {
		playerXId: player,
		playerOId: opponent,
	  };
	try {
		const response = await fetch(`http://tictactoe_db_container:3003/tictactoe/head-to-head/${player}/${opponent}`, {
			method: 'GET',
			headers: {
			'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			if (response.status === 404) {
			return { wins: 0, losses: 0, draws: 0, total: 0 };
			} else {
			throw new Error(`Request failed with status ${response.status}`);
			}
		}
		const result = await response.json();
		const parsedResult = statsSchema.parse(result);
		return parsedResult;
	} catch (error) {
		console.error("Error fetching head-to-head stats:", error);
		throw error;
	}
}
