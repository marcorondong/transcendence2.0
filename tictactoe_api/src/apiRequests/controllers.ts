import { FastifyReply, FastifyRequest } from "fastify";
import {
	idZodSchema,
	IdParams,
	headToHeadZodSchema,
	HeadToHeadParams,
} from "./zodSchemas";
import { getGamesById, getGamesHeadToHead } from "../dbUtils";

export async function gamesHandler(
	req: FastifyRequest<{ Params: IdParams }>,
	res: FastifyReply,
) {
	const { id } = idZodSchema.parse(req.params);
	const games = await getGamesById(id);
	console.log("Games", games);
	res.status(200).send(games);
}

export async function totalStatsHandler(
	req: FastifyRequest<{ Params: IdParams }>,
	res: FastifyReply,
) {
	const { id } = idZodSchema.parse(req.params);
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
	req: FastifyRequest<{ Params: HeadToHeadParams }>,
	res: FastifyReply,
) {
	const { id, opponentId } = headToHeadZodSchema.parse(req.params);
	const games = await getGamesHeadToHead(id, opponentId);

	const headToHeadStats = {
		wins: 0,
		losses: 0,
		draws: 0,
	};
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
