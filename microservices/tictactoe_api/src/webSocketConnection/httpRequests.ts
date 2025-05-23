import { statsSchema, userZodSchema } from "./zodSchema";
import { env } from "../utils/env";

export async function postResult(
	player: string,
	opponent: string,
	playerSign: string,
) {
	try {
		const data = {
			playerXId: player,
			playerOId: opponent,
			result: playerSign,
		};
		const response = await fetch(
			env.TICTACTOE_DB_CREATE_GAME_REQUEST_DOCKER,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			},
		);
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
		const response = await fetch(
			`${env.TICTACTOE_DB_HEAD_TO_HEAD_REQUEST_DOCKER}/${player}/${opponent}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			},
		);

		if (!response.ok) {
			if (response.status === 404) {
				return { wins: 0, losses: 0, draws: 0, total: 0 };
			} else {
				throw new Error(
					`Request failed with status ${response.status}`,
				);
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

export async function getRequestVerifyConnection(
	cookie: string,
	socket: WebSocket,
) {
	const response = await fetch(
		env.AUTH_API_VERIFY_CONNECTION_REQUEST_DOCKER,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Cookie": cookie,
			},
		},
	);
	if (!response.ok) {
		socket.close(1008, "Authentication failed");
		const errorMessage = await response.text();
		throw new Error(`Verify request failed: ${errorMessage}`);
	}
	const data = await response.json();
	const { id, nickname } = userZodSchema.parse(data);
	return { id, nickname };
}
