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

test("Paddle hit box points", () =>
{
	const paddle:Paddle = new Paddle(new Point(0,0));

	const allPoints:Point[] = paddle.getPaddleHitBoxPoints();
	// for(const onePoint of allPoints)
	// {
	// 	console.log(onePoint);
	// }
	const first = allPoints[0];
	expect(first.getY()).toBeCloseTo(-0.5, 1);
	const last = allPoints[allPoints.length - 1];
	expect(last.getY()).toBeCloseTo(0.5, 1);
	expect(allPoints.length).toBeGreaterThanOrEqual((paddle.height / 0.01));
	expect(allPoints.length).toBeLessThanOrEqual((paddle.height / 0.01) + 1);
})