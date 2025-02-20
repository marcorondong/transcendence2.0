import { Point } from "../src/Point";

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