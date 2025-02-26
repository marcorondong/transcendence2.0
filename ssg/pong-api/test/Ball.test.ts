import { Ball } from "../src/Ball";
import { Point, VectorDirection } from "../src/Point";

test("Ball hitbox on raidus 0.25", () =>
{
	const ballCenter:Point = new Point(0,0);
	const ball:Ball = new Ball(ballCenter, new Point(0,0), 0.25);

	const hit:boolean = ball.isHit(new Point(0,0));
	expect(hit).toBe(true);

	const notHit:boolean = ball.isHit(new Point(5,0));
	expect(notHit).toBe(false);

	const b:Point = new Point(0.2, -0.1);
	const c:Point = new Point(0.2, -0.2);
	const d:Point = new Point(0.25, 0.15);
	const e:Point = new Point(-0.15, 0.2);
	let hitted:boolean = ball.isHit(b);
	expect(hitted).toBe(true);
	hitted = ball.isHit(e);
	expect(hitted).toBe(true);

	let missed = ball.isHit(d);
	expect(missed).toBe(false);

	missed = ball.isHit(c);
	expect(missed).toBe(false);
	
})



test("ball hitbox points on radius 0.25 and position 0,0", () => 
{
	const ball:Ball = new Ball(new Point(0,0), new Point(0,0), 0.25);
	const allPoints: Map<VectorDirection, Point> = ball.getBallHitBoxPoints();

	const upPoint = allPoints.get(VectorDirection.UP);
	const downPoint = allPoints.get(VectorDirection.DOWN);
	const leftPoint = allPoints.get(VectorDirection.LEFT);
	const rightPoint = allPoints.get(VectorDirection.RIGHT);

	const upRight = allPoints.get(VectorDirection.RIGHT_UP);
	const downRight = allPoints.get(VectorDirection.RIGHT_DOWN);
	const upLeft = allPoints.get(VectorDirection.LEFT_UP);
	const downLeft = allPoints.get(VectorDirection.LEFT_DOWN);

	expect(rightPoint?.getX()).toBeCloseTo(0.25, 2);
	expect(rightPoint?.getY()).toBeCloseTo(0, 2);

	expect(upRight?.getX()).toBeCloseTo(0.18, 2);
	expect(upRight?.getY()).toBeCloseTo(0.18, 2);

	expect(upPoint?.getX()).toBeCloseTo(0, 2);
	expect(upPoint?.getY()).toBeCloseTo(0.25, 2);

	expect(upLeft?.getX()).toBeCloseTo(-0.18, 2);
	expect(upLeft?.getY()).toBeCloseTo(0.18, 2);

	expect(leftPoint?.getX()).toBeCloseTo(-0.25, 2);
	expect(leftPoint?.getY()).toBeCloseTo(0, 2);

	expect(downLeft?.getX()).toBeCloseTo(-0.18, 2);
	expect(downLeft?.getY()).toBeCloseTo(-0.18, 2);

	expect(downPoint?.getX()).toBeCloseTo(0, 2);
	expect(downPoint?.getY()).toBeCloseTo(-0.25, 2);

	expect(downRight?.getX()).toBeCloseTo(0.18, 2);
	expect(downRight?.getY()).toBeCloseTo(-0.18, 2);
	
})