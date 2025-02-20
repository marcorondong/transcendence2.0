import { Point } from "./Point"

export class Ball
{
	protected position:Point;
	protected vector:Point;

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
}