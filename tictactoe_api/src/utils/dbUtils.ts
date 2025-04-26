
export async function postResult(player: string, opponent: string, playerSign: string) {
	const data = {
		playerXId: player,
		playerOId: opponent,
		result: playerSign,
	  };

	  try {
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

		const result = await response.json();
		console.log('Success:', result);
		return result;
	  } catch (error) {
		console.error('Error:', error);
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
		  return { wins: 0, losses: 0, draws: 0, total: 0 };
		}

		const result = await response.json();
		console.log('Success:', result);
		return result;
	  } catch (error) {
		console.error('Error:', error);
		throw error;
	  }
}
