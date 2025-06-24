import { DataSchema } from "./zodSchemas";
import type { Client } from "../utils/Client";
import {
	messageHandler,
	inviteHandler,
	updateNicknameHandler,
	refreshFriendListHandler,
} from "./controllers";
import { connectionHandler } from "./controllers";

export async function requests(message: string, client: Client) {
	const raw = JSON.parse(message.toString());
	const data = DataSchema.parse(raw);

	if (data.type === "message") await messageHandler(data, client);
	else if (data.type === "invite") await inviteHandler(data, client);
	else if (data.type === "updateNickname")
		await updateNicknameHandler(client);
	else if (data.type === "refreshFriendList")
		await refreshFriendListHandler(data, client);
	else throw new Error("Server: invalid request type");
}
