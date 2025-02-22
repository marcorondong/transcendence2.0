import { Point } from "./Point";

const MOVE_MODIFIER = 0.1;

export class Paddle
{
	protected position:Point;
	readonly height:number;

	constructor(position: Point, height:number = 1)
	{
		this.position = position;
		this.height = height;
	}

	//TODO: add protection to not go over field
	moveUp():void 
	{
		const newY = this.position.getY() + MOVE_MODIFIER;
		this.position.setY(newY);
	}

	moveDown():void 
	{
		const newY = this.position.getY() - MOVE_MODIFIER;
		this.position.setY(newY);
	}

	move(direction: "up" | "down"):void 
	{
		if(direction === "up")
			this.moveUp();
		else if (direction === "down")
			this.moveDown();
		else 
			console.warn("Invalid movement direction");
	}

	getPosition(): Point
	{
		return this.position;
	}
}