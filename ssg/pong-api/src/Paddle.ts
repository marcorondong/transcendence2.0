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

	getPaddleHitBoxPoints(): Point[]
	{
		const allPoints:Point[] = new Array<Point>();
		const x = this.getPosition().getX();
		const center_y = this.getPosition().getY();
		for(let y = center_y - (this.height / 2); y <= center_y + (this.height / 2); y += 0.1)
		{
			const hitPoint = new Point(x, y);
			allPoints.push(hitPoint);
		}
		return allPoints;

	}
}