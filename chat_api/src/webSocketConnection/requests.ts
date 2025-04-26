import { DataSchema } from "./zodSchemas";
import type { Client } from "../utils/Client";
import {
	messageHandler,
	blockHandler,
	blockStatusHandler,
	inviteHandler,
	terminateHandler,
} from "./controllers";

export async function webSocketRequests(message: string, client: Client) {
	const raw = JSON.parse(message.toString());
	const data = DataSchema.parse(raw);

	switch (data.type) {
		case "message":
			messageHandler(data, client);
			break;
		case "block":
			await blockHandler(data, client);
			break;
		case "blockStatus":
			blockStatusHandler(data, client);
			break;
		case "invite":
			await inviteHandler(data, client);
			break;
		case "terminate":
			terminateHandler(data, client);
			break;
		default:
			throw new Error(`Unknown message type: ${data}`);
	}
}
