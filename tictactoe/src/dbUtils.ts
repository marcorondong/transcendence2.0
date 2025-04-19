// import { PrismaClient } from "generated/prisma";

// const prisma = new PrismaClient();

// export async function createGameInDB(
// 	playerXId: string,
// 	playerOId: string,
// 	result: string,
// ) {
// 	await prisma.game.create({
// 		data: { playerXId, playerOId, result },
// 	});
// }

// export async function getGamesById(playerId: string) {
// 	const games = await prisma.game.findMany({
// 		where: {
// 			OR: [{ playerXId: playerId }, { playerOId: playerId }],
// 		},
// 	});
// 	return games;
// }

// export async function getGamesHeadToHead(playerId: string, opponentId: string) {
// 	const games = await prisma.game.findMany({
// 		where: {
// 			OR: [
// 				{
// 					AND: [{ playerXId: playerId }, { playerOId: opponentId }],
// 				},
// 				{
// 					AND: [{ playerXId: opponentId }, { playerOId: playerId }],
// 				},
// 			],
// 		},
// 	});
// 	return games;
// }

export async function postResult(player: string, opponent: string, playerSign: string) {
	const data = {
		playerXId: player,
		playerOId: opponent,
		result: playerSign,
	  };

	  try {
		const response = await fetch("http://tictactoe_db_container:3003/tictactoe/createGame", {
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
// export async function postResult(
// 	player: string,
// 	opponent: string,
// 	playerSign: string,
// ) {
// 	const response = await fetch(
// 		"http://tictactoe_db_container:3003/tictactoe/createGame",
// 		{
// 			method: "POST",
// 			headers: {
// 				"Content-Type": "application/json",
// 			},
// 			body: JSON.stringify({
// 				playerXId: player,
// 				playerOId: opponent,
// 				result: "X",
// 			}),
// 		},
// 	);
// }
