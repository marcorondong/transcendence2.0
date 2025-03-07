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

	//console.log(d.getMovementDirection());
	expect(d.getMovementDirection()).toBe(VectorDirection.RIGHT);
	expect(e.getMovementDirection()).toBe(VectorDirection.RIGHT_UP);
	expect(f.getMovementDirection()).toBe(VectorDirection.RIGHT_DOWN);

	expect(g.getMovementDirection()).toBe(VectorDirection.LEFT);
	expect(h.getMovementDirection()).toBe(VectorDirection.LEFT_UP);
	expect(i.getMovementDirection()).toBe(VectorDirection.LEFT_DOWN);
})

test("Distance between points tester", () =>
{
	const a:Point = new Point(0,0);
	const b:Point = new Point(0,0);
	const distance = Point.calculateDistance(a, b);
	expect(distance).toBe(0);
})


test("Distance between two points on the X-axis", () => {
    const a: Point = new Point(0, 0);
    const b: Point = new Point(5, 0);
    const distance = Point.calculateDistance(a, b);
    expect(distance).toBe(5);
});

test("Distance between two points on the Y-axis", () => {
    const a: Point = new Point(0, 0);
    const b: Point = new Point(0, 7);
    const distance = Point.calculateDistance(a, b);
    expect(distance).toBe(7);
});

test("Distance between two points diagonally", () => {
    const a: Point = new Point(1, 1);
    const b: Point = new Point(4, 5);
    const distance = Point.calculateDistance(a, b);
    expect(distance).toBeCloseTo(5); // Using `toBeCloseTo` for floating-point precision
});

test("Distance between negative and positive coordinates", () => {
    const a: Point = new Point(-3, -4);
    const b: Point = new Point(0, 0);
    const distance = Point.calculateDistance(a, b);
    expect(distance).toBe(5);
});

test("Distance with floating-point numbers", () => {
    const a: Point = new Point(1.5, 2.5);
    const b: Point = new Point(4.2, 6.8);
    const distance = Point.calculateDistance(a, b);
    expect(distance).toBeCloseTo(5.08, 2); // Rounded to 2 decimal places
});

test("Vector between two points", () => 
{
	const pointA:Point = new Point(2,3);
	const pointB:Point = new Point(5,7);
	const vector = Point.calculateVector(pointA, pointB);
	expect(vector.getX()).toBe(3);
	expect(vector.getY()).toBe(4);
})

test("Vector between two points in different quadrants", () => {
	const pointA: Point = new Point(-3, -2);
	const pointB: Point = new Point(4, 5);
	const vector = Point.calculateVector(pointA, pointB);
	expect(vector.getX()).toBe(7);
	expect(vector.getY()).toBe(7);
});

test("Vector between two points with negative coordinates", () => {
	const pointA: Point = new Point(-5, -3);
	const pointB: Point = new Point(-2, -6);
	const vector = Point.calculateVector(pointA, pointB);
	expect(vector.getX()).toBe(3);
	expect(vector.getY()).toBe(-3);
});

test("Vector between the same points (zero vector)", () => {
	const pointA: Point = new Point(1, 1);
	const pointB: Point = new Point(1, 1);
	const vector = Point.calculateVector(pointA, pointB);
	expect(vector.getX()).toBe(0);
	expect(vector.getY()).toBe(0);
});

test("Vector with one point at origin", () => {
	const pointA: Point = new Point(0, 0);
	const pointB: Point = new Point(7, -3);
	const vector = Point.calculateVector(pointA, pointB);
	expect(vector.getX()).toBe(7);
	expect(vector.getY()).toBe(-3);
});

test("Vector when moving in the negative direction", () => {
	const pointA: Point = new Point(8, 5);
	const pointB: Point = new Point(2, 1);
	const vector = Point.calculateVector(pointA, pointB);
	expect(vector.getX()).toBe(-6);
	expect(vector.getY()).toBe(-4);
});

test("Vector speed / length", () =>
{
	const vector:Point = new Point(1, 1);
	const speed = Point.calculateVectorSpeed(vector);
	expect(speed).toBeCloseTo(Math.sqrt(2), 2);
})

test("Zero vector speed", () => {
    const vector: Point = new Point(0, 0);
    const speed = Point.calculateVectorSpeed(vector);
    expect(speed).toBe(0);
});

test("Negative vector components", () => {
    const vector: Point = new Point(-3, -4);
    const speed = Point.calculateVectorSpeed(vector);
    expect(speed).toBeCloseTo(5, 2);
});

test("Larger vector components", () => {
    const vector: Point = new Point(100, 200);
    const speed = Point.calculateVectorSpeed(vector);
    expect(speed).toBeCloseTo(Math.sqrt(100**2 + 200**2), 2);
});

test("Floating-point precision", () => {
    const vector: Point = new Point(0.1, 0.2);
    const speed = Point.calculateVectorSpeed(vector);
    expect(speed).toBeCloseTo(Math.sqrt(0.1**2 + 0.2**2), 5);
});