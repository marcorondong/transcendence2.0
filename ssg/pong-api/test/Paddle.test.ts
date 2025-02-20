import { Paddle } from "../src/Paddle";
import { Point } from "../src/Point";

test("Paddle movement", () =>
{
	const leftPaddle:Paddle = new Paddle(new Point(0,0));
	var testPoint = leftPaddle.getPosition();
	expect(testPoint.getX()).toBe(0);
	expect(testPoint.getY()).toBe(0);

	leftPaddle.moveUp();
	testPoint = leftPaddle.getPosition();
	expect(testPoint.getY()).toBe(0.1);

	leftPaddle.moveDown();
	leftPaddle.moveDown();
	testPoint = leftPaddle.getPosition();
	expect(testPoint.getY()).toBe(-0.1);

})