import { FastifyReply, FastifyRequest } from "fastify";
import { gamesZodSchema, GamesParams, headToHeadZodSchema, HeadToHeadParams } from "./game.zodSchemas";
import { getGamesById, getGamesHeadToHead } from "../dbUtils";

export async function gamesHandler(
	req: FastifyRequest<{ Params: GamesParams }>,
	res: FastifyReply,
) {
	const { id } = gamesZodSchema.parse(req.params);
	const games = await getGamesById(id);
	res.status(200).send(games);
}

export async function totalHandler(
	req: FastifyRequest<{ Params: GamesParams }>,
	res: FastifyReply,
) {
	const { id } = gamesZodSchema.parse(req.params);
	const games = await getGamesById(id);

	const totalStats = {
		wins: 0,
		losses: 0,
		draws: 0,
	};

	games.forEach((game) => {
		if (game.result === "DRAW") totalStats.draws++;
		else if (
			(game.result === "X" && game.playerXId === id) ||
			(game.result === "O" && game.playerOId === id)
		)
			totalStats.wins++;
		else totalStats.losses++;
	});

	res.status(200).send(totalStats);
}

export async function headToHeadHandler(
	req: FastifyRequest<{ Params: GamesParams }>,
	res: FastifyReply,
) {
	const { id, opponentId } = headToHeadZodSchema.parse(req.params);
	const games = await getGamesHeadToHead(id, opponentId);

	const headToHeadStats = {
		wins: 0,
		losses: 0,
		draws: 0,
	};

	console.log("Head to Head Stats", games);

	games.forEach((game) => {
		if (game.result === "DRAW") headToHeadStats.draws++;
		else if (
			(game.result === "X" && game.playerXId === id) ||
			(game.result === "O" && game.playerOId === id)
		)
			headToHeadStats.wins++;
		else headToHeadStats.losses++;
	});

	res.status(200).send(headToHeadStats);
}
