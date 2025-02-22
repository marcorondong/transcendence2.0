import { Point } from "./Point"

export class Ball
{
	protected position:Point;
	protected vector:Point;
	readonly radius = 0.25;

	constructor(position:Point, vector:Point = new Point(0.1, 0)) 
	{
		this.position = position;
		this.vector = vector;	
	}

	moveBall()
	{
		this.position.add(this.vector);
	}

	setDirection(vector:Point):void 
	{
		this.vector = vector;
	}
	
	getDirection(): Point
	{
		return this.vector;
	}

	getPosition():Point
	{
		return this.position;
	}

	setPosition(point:Point) :void 
	{
		this.position = point;
	}

	isHit(otherObjectX: number, OtherObjectY:number):boolean
	{
		const centerX = this.getPosition().getX();
		const centerY = this.getPosition().getY();
		const x = otherObjectX;
		const y = OtherObjectY;

		const result:number = Math.pow((x - centerX), 2) + Math.pow((y - centerY), 2);
		const radiusSquared = Math.pow(this.radius, 2);
		if(result < radiusSquared)
			return true;
		return false;
	}
}