export class Point
{
	protected xPos: number;
	protected yPos: number;
	constructor(x: number, y: number)
	{
		this.xPos = x;
		this.yPos = y;
	}

	equals(otherPoint: Point):boolean
	{
		return (otherPoint.xPos === this.xPos && otherPoint.yPos === this.yPos)
	}

	getX():number
	{
		return this.xPos;
	}

	getY():number 
	{
		return this.yPos;
	}

	setX(newX: number)
	{
		this.xPos = newX; 
	}

	setY(newY: number)
	{
		this.yPos = newY;
	}
}