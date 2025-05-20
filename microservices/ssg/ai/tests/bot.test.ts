import { Bot } from "../src/bot";
import readline from "readline";

let bot = new Bot(
	JSON.stringify({
		"difficulty": "hard",
		"mode": "mandatory",
		"roomId": "currently unused",
	}
));

let gamestate = {
	ball: {x :0, y: 0},
	leftPaddle: {x: 0, y: 0, height: 1},
	rightPaddle: {x: 0, y: 0, height: 1},
	score: {leftGoals: 0, rightGoals: 0, time: 0},
}

function getgamestatfromuserinput() {

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	rl.question("Enter ball x: ", (input) => {
		gamestate.ball.x = parseFloat(input);
	});
	rl.question("Enter ball y: ", (input) => {
		gamestate.ball.y = parseFloat(input);
	});
	rl.question("Enter left goals: ", (input) => {
		gamestate.score.leftGoals = parseInt(input);
	});
	rl.question("Enter right goals: ", (input) => {
		gamestate.score.rightGoals = parseInt(input);
	});
}

while (true) {
	getgamestatfromuserinput();
	bot.handleEvent(gamestate);
}
