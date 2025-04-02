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
	private height: number;
	readonly initialPosition: Point;
	readonly INITIAL_HEIGHT: number;

	constructor(position: Point, height: number = 1)
	{
		this.position = position;
		this.height = height;
		this.initialPosition = new Point(position.getX(), position.getY());
		this.INITIAL_HEIGHT = height;
	}

	getPaddleJson(): IPaddleJson
	{
		return {
			x: this.getPosition().getX(),
			y: this.getPosition().getY(),
			height: this.getHeight()
		}
	}

	getHeight(): number
	{
		return this.height;
	}

	setHeight(freshHeight: number): void
	{
		this.height = freshHeight;
	}

	resetPosition(): void
	{
		this.position.setX(this.initialPosition.getX());
		this.position.setY(this.initialPosition.getY());
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
		if(this.getHeight() <= 0)
		{
			return allPoints;
		}
		const x = this.getPosition().getX();
		const center_y = this.getPosition().getY();
		for(let y = center_y - (this.getHeight() / 2); y <= center_y + (this.getHeight() / 2); y += 0.01)
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

	shrinkPaddle(): void
	{
		const shrinkModifier = this.INITIAL_HEIGHT * 0.2;
		let freshHeight = this.getHeight() - shrinkModifier;
		if(freshHeight < 0.01)
			freshHeight = 0;
		this.setHeight(freshHeight);
	}

	getMoveModifier(): number 
	{
		return MOVE_MODIFIER;
	}

	private moveUp(): void 
	{
		const newY = this.position.getY() + MOVE_MODIFIER;
		this.position.setY(newY);
	}

	private moveDown(): void 
	{
		const newY = this.position.getY() - MOVE_MODIFIER;
		this.position.setY(newY);
	}
}