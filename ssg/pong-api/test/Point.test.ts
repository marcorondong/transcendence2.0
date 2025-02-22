import { Point } from "../src/Point";
import { VectorDirection } from "../src/Point";

test('Points', () => {
	//expect(sum(1, 2)).toBe(3);
	const a:Point = new Point(0,0);
	const b:Point = new Point(0,0);
	var same:boolean = a.equals(b);
	expect(same).toBe(true);
	b.setY(1);
	same = a.equals(b);
	expect(same).toBe(false);
	expect(b.getY()).toBe(1);
  });


test("Vector movement", () => 
{
	const a:Point = new Point(0,0);
	const b:Point = new Point(0,1);
	const c:Point = new Point(0,-1);
	
	const d:Point = new Point(1,0);
	const e:Point = new Point(1,1);
	const f:Point = new Point(1,-1);

	const g:Point = new Point(-1,0);
	const h:Point = new Point(-1,1);
	const i:Point = new Point(-1,-1);

	expect(a.getMovementDirection()).toBe(VectorDirection.NO);
	expect(b.getMovementDirection()).toBe(VectorDirection.UP);
	expect(c.getMovementDirection()).toBe(VectorDirection.DOWN);

	console.log(d.getMovementDirection());
	expect(d.getMovementDirection()).toBe(VectorDirection.RIGHT);
	expect(e.getMovementDirection()).toBe(VectorDirection.RIGHT_UP);
	expect(f.getMovementDirection()).toBe(VectorDirection.RIGHT_DOWN);

	expect(g.getMovementDirection()).toBe(VectorDirection.LEFT);
	expect(h.getMovementDirection()).toBe(VectorDirection.LEFT_UP);
	expect(i.getMovementDirection()).toBe(VectorDirection.LEFT_DOWN);
})