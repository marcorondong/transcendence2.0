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

	/**
	 * modify this object with new x and y postion that adds other point(vector) x and y position 
	 * @param secondPoint x and y that will be added to current object
	 */
	add(secondPoint: Point):void
	{
		const newX = this.xPos + secondPoint.xPos;
		const newY = this.yPos + secondPoint.yPos;
		this.setX(newX);
		this.setY(newY);
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