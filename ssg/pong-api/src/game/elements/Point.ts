export enum VectorDirection{
	NO = 0,
	UP = 1,
	DOWN = 2,

	RIGHT = 4,
	RIGHT_UP = 5,
	RIGHT_DOWN = 6,

	LEFT = 8,
	LEFT_UP = 9,
	LEFT_DOWN = 10
}

export class Point
{
	protected xPos: number;
	protected yPos: number;
	
	constructor(x: number, y: number)
	{
		this.xPos = x;
		this.yPos = y;
	}

	static calculateDistance(pointA: Point, pointB: Point)
	{
		const a = pointA.getX();
		const b = pointA.getY();
		const p = pointB.getX();
		const q = pointB.getY();

		const distance_squared = Math.pow((a - p), 2) + Math.pow((b - q), 2)
		return Math.sqrt(distance_squared);
	}

/**
 * 
 * @param pointA from 
 * @param pointB to
 * return point that represent vector from A to B
 */
	static calculateVector(pointA: Point, pointB: Point): Point
	{
		const x1 = pointA.getX();
		const y1 = pointA.getY();
		const x2 = pointB.getX();
		const y2 = pointB.getY();

		const vectorX = x2 - x1;
		const vectorY = y2 - y1;
		const vector: Point = new Point(vectorX, vectorY);
		return vector;
	}

	static calculateVectorSpeed(vector: Point): number
	{
		const firstStep = Math.pow(vector.getX(), 2) + Math.pow(vector.getY(),2);
		const speed = Math.sqrt(firstStep);
		return speed;
	}

	equals(otherPoint: Point): boolean
	{
		return (otherPoint.xPos === this.xPos && otherPoint.yPos === this.yPos)
	}

	/**
	 * modify this object with new x and y postion that adds other point(vector) x and y position 
	 * @param secondPoint x and y that will be added to current object
	 */
	add(secondPoint: Point): void
	{
		const newX = this.xPos + secondPoint.xPos;
		const newY = this.yPos + secondPoint.yPos;
		this.setX(newX);
		this.setY(newY);
	}

	getX(): number
	{
		return this.xPos;
	}

	setX(newX: number): void
	{
		this.xPos = newX; 
	}
	
	getY(): number 
	{
		return this.yPos;
	}
	
	setY(newY: number): void
	{
		this.yPos = newY;
	}

	getBiggerAxis(): number 
	{
		if(Math.abs(this.xPos) > Math.abs(this.yPos))
			return this.getX();
		return this.getY();
	}

	getMovementDirection(): VectorDirection
	{
		const x = this.getX();
		const y = this.getY();
		const factorX = this.getFactor(x);
		const factorY = this.getFactor(y);
		return ((4 * factorX ) + factorY)
	}

	private getFactor(num: number): 0 | 1 | 2
	{
		if(num === 0)
			return 0;
		else if(num > 0)
			return 1;
		return 2;
	}

}