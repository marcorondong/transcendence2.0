import { ScoreBoard } from "../src/ScoreBoard";

test("Score board test", ()=>
{
	const score:ScoreBoard = new ScoreBoard();
	score.score("right");
	score.score("right");
	score.score("left");
	expect(score.getScoreJson().leftGoals).toBe(1);
	expect(score.getScoreJson().rightGoals).toBe(2);
	expect(score.getScoreJson().time).toBe(-1);
})