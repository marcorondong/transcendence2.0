import { FastifyRequest } from "fastify";
import {
	TournamentSize,
	TournamentSizeQuerySchema,
	HeadToHeadQuerySchema,
	RoomIdType,
} from "./zodSchema";
import { ZodError } from "zod";
import { WebSocket } from "@fastify/websocket";

function sendError(
	connection: WebSocket,
	errorZod: ZodError,
	shortDescription: string = "ERROR",
): void {
	console.error(`${shortDescription}: ${errorZod}`);
	const jsonError = JSON.stringify({
		error: shortDescription,
		zodDetails: errorZod,
	});
	connection.send(jsonError);
}

export class Parsing {
	public static parseTournamentSize(
		req: FastifyRequest,
		connection: WebSocket,
	): TournamentSize | false {
		const parseQuery = TournamentSizeQuerySchema.safeParse(req.query);
		if (!parseQuery.success) {
			sendError(
				connection,
				parseQuery.error,
				"Invalid query sent [Tournament]",
			);
			connection.close();
			return false;
		}
		const { tournamentSize } = parseQuery.data;
		return tournamentSize;
	}

	public static parseRoomId(
		req: FastifyRequest,
		connection: WebSocket,
	): RoomIdType | false {
		const parseQuery = HeadToHeadQuerySchema.safeParse(req.query);
		if (!parseQuery.success) {
			sendError(connection, parseQuery.error, "Invalid query sent");
			connection.close(1008, "Room id violation");
			return false;
		}
		const { roomId } = parseQuery.data;
		return roomId;
	}
}
