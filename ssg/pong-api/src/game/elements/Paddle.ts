import { Point } from "./Point";

const MOVE_MODIFIER = 0.05;

export interface IPaddleJson
{
	x: number,
	y: number, 
	height: number
}

export class Paddle
{
	protected position: Point;
	readonly height: number;
	readonly initialPosition: Point; 

	constructor(position: Point, height: number = 1)
	{
		this.position = position;
		this.height = height;
		this.initialPosition = new Point(position.getX(), position.getY());
	}

	getPaddleJson(): IPaddleJson
	{
		return {
			x: this.getPosition().getX(),
			y: this.getPosition().getY(),
			height: this.height
		}
	}

	moveUp(): void 
	{
		const newY = this.position.getY() + MOVE_MODIFIER;
		this.position.setY(newY);
	}

	resetPosition(): void
	{
		this.position.setX(this.initialPosition.getX());
		this.position.setY(this.initialPosition.getY());
	}

	moveDown(): void 
	{
		const newY = this.position.getY() - MOVE_MODIFIER;
		this.position.setY(newY);
	}

	move(direction: "up" | "down"): void 
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

	getPaddleHitBoxPoints(ballDirection: number): Point[]
	{
		const allPoints: Point[] = new Array<Point>();
		const x = this.getPosition().getX();
		const center_y = this.getPosition().getY();
		for(let y = center_y - (this.height / 2); y <= center_y + (this.height / 2); y += 0.01)
		{
			if(ballDirection > 0)
			{
				for(let x = this.getPosition().getX() + ballDirection * 2; x >= this.getPosition().getX(); x -= 0.01)
				{
					const hitPoint = new Point(x, y);
					allPoints.push(hitPoint);
				}
			}
			else 
			{
				for(let x = this.getPosition().getX() + ballDirection * 2; x <= this.getPosition().getX(); x += 0.01)
				{
					const hitPoint = new Point(x, y);
					allPoints.push(hitPoint);
				}
			}
		}
		return allPoints;
	}

	getMoveModifier(): number 
	{
		return MOVE_MODIFIER;
	}
}