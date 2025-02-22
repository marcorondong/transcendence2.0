import { Ball } from "../src/Ball";
import { Point } from "../src/Point";

test("Ball hitbox on raidus 0.25", () =>
{
	const ballCenter:Point = new Point(0,0);
	const ball:Ball = new Ball(ballCenter);

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