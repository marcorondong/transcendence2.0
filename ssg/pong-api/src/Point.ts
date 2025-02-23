import { get } from "http";

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

	getBiggerAxis():number 
	{
		if(Math.abs(this.xPos) > Math.abs(this.yPos))
			return this.getX();
		return this.getY();
	}

	private getFactor(num:number): 0 | 1 | 2
	{
		if(num === 0)
			return 0;
		else if(num > 0)
			return 1;
		return 2;
	}

	getMovementDirection(): VectorDirection
	{
		const x = this.getX();
		const y = this.getY();
		const factorX = this.getFactor(x);
		const factorY = this.getFactor(y);
		return ((4 * factorX ) + factorY)
	}
}