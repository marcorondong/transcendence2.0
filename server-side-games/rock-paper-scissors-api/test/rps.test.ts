import {Choice, RPSGame} from "../src/rps"


test('check shapes', () => {
  //expect(sum(1, 2)).toBe(3);
  const rock = new Choice("rock");
  const paper = new Choice("paper");
  const scisors = new Choice("scissors");
  expect(scisors.getChoice()).toBe("scissors");
  expect(rock.getChoice()).toBe("rock");
  expect(paper.getChoice()).toBe("paper");
});


test("check winner", () =>
{
	const rockPlayer = new Choice("rock");
	const paperPlayer = new Choice("paper");
	const scisorsPlayer = new Choice("scissors");

	expect (RPSGame.getWinner(rockPlayer, rockPlayer)).toBe(0);
	expect (RPSGame.getWinner(rockPlayer, scisorsPlayer)).toBe(1);
	expect (RPSGame.getWinner(rockPlayer, paperPlayer)).toBe(2);

	expect (RPSGame.getWinner(scisorsPlayer, scisorsPlayer)).toBe(0);
	expect (RPSGame.getWinner(scisorsPlayer, paperPlayer)).toBe(1);
	expect (RPSGame.getWinner(scisorsPlayer, rockPlayer)).toBe(2);


	expect (RPSGame.getWinner(paperPlayer, paperPlayer)).toBe(0);
	expect (RPSGame.getWinner(paperPlayer, rockPlayer)).toBe(1);
	expect (RPSGame.getWinner(paperPlayer, scisorsPlayer)).toBe(2);
})