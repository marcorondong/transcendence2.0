import { Bot } from "./src/bot";

function testCountdown() {
	let bot = new Bot(JSON.stringify(
		{
			"difficulty": "hard",
			"host": "127.0.0.1",
			"port": "3010",
			"roomId": "currently unused",
			"side": "right",
		}
	));
	for (let index = 0; index < 60; index++) {
		bot.handleEvent(JSON.stringify(
			{
				ball: {x :0, y: 0},
				leftPaddle: {x: 0, y: 0},
				rightPaddle: {x: 0, y: 0},
			}
		));
	}
	
	bot.handleEvent(JSON.stringify(
		{
			ball: {x :0, y: 0},
			leftPaddle: {x: 0, y: 0},
			rightPaddle: {x: 0, y: 0},
		}
	));
}