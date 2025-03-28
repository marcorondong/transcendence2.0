import { Bot } from "./bot";

new Bot(JSON.stringify(
	{
		"difficulty": "hard",
		"host": "127.0.0.1",
		"port": "3010",
		"roomId": "currently unused",
		"side": "right",
	}
));
