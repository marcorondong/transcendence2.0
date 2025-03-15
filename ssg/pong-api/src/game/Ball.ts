import { Point, VectorDirection } from "./Point"

const MOVE_COEFFICIENT = 5;

export class Ball
{
	protected position:Point;
	protected vector:Point;
	readonly radius;
	readonly speed:number;
	readonly initialVector:Point

	constructor(position:Point, vector:Point = new Point(-0.1, 0.0), radius=0.075) 
	{
		this.position = position;
		this.vector = vector;
		this.initialVector = vector;
		this.radius = radius;
		this.speed = Point.calculateVectorSpeed(vector);
	}

	moveBall()
	{
		this.position.add(this.vector);
	}

	setDirection(vector:Point):void 
	{
		this.vector = vector;
	}

	resetDirection(direction: "left" | "right"):void
	{
		let newX = this.initialVector.getX();
		if(direction === "left" && newX > 0)
		{
			newX *= -1;
		}
		if(direction === "right" && newX < 0)
		{
			newX *= -1;
		}
		this.vector = this.initialVector;
		this.vector.setX(newX);
	}
	
	getDirection(): Point
	{
		return this.vector;
	}

	simpleBounceX(): void 
	{
		const newX = -1 * this.getDirection().getX();
		this.getDirection().setX(newX);
	}

	simpleBounceY():void 
	{
		const newY = -1 * this.getDirection().getY();
		this.getDirection().setY(newY);
	}

	caluclateComplexBounceDirection(pointA:Point, maxDoubleDistanceFromPoint:number):Point
	{
		const currentDirectionX = this.getDirection().getX();
		const vector:Point = Point.calculateVector(pointA, this.getPosition());
		const vecY = vector.getY();
		const centerMissPercent = Math.abs(vecY)/maxDoubleDistanceFromPoint;
		const xSquared = Math.pow(this.speed, 2) / (1 + Math.pow(centerMissPercent, 2));
		let newX = Math.sqrt(xSquared);
		let newY = newX * centerMissPercent;
		if(currentDirectionX > 0)
			newX *= -1;
		if(vecY < 0)
			newY *= -1;
		return new Point(newX, newY);

	}

	getPosition():Point
	{
		return this.position;
	}

	setPosition(point:Point) :void 
	{
		this.position = point;
	}

	getRadius():number
	{
		return this.radius;
	}

	getBallDirection(): VectorDirection
	{
		return this.getDirection().getMovementDirection();
	}

	isMovingLeft(): boolean
	{
		if(this.getDirection().getX() < 0)
			return true;
		return false;
	}

	isMovingRight(): boolean
	{
		if(this.getDirection().getX() > 0)
			return true;
		return false;
	}

	isMovingUp(): boolean
	{
		if(this.getDirection().getY() > 0)
			return true;
		return false;
	}

	isMovingDown(): boolean
	{
		if(this.getDirection().getY() < 0)
			return true;
		return false;
	}

	/**
	 * 
	 * @returns distance in which is possible that ball with hit something in next MOVE_COEFFICIENT frames (aka next 5 frames)
	 */
	getCriticalDistance():number 
	{
		const critDistance = this.radius + (Math.abs(this.getDirection().getBiggerAxis())) * MOVE_COEFFICIENT;
		return critDistance; 
	}



	isHit(otherPoint:Point):boolean
	{
		const centerX = this.getPosition().getX();
		const centerY = this.getPosition().getY();
		const x = otherPoint.getX();
		const y = otherPoint.getY();

		const result:number = Math.pow((x - centerX), 2) + Math.pow((y - centerY), 2);
		const radiusSquared = Math.pow(this.radius, 2);
		if(result <= radiusSquared)
			return true;
		return false;
	}


	/**
	 * 
	 * @returns 8 points of circle, aka every 45 degree
	 */
	getBallHitBoxPoints(): Map<VectorDirection, Point>
	{
		const allPoints: Map<VectorDirection, Point> = new Map<VectorDirection, Point>();
		const directions: VectorDirection[] = [VectorDirection.RIGHT, VectorDirection.RIGHT_UP, VectorDirection.UP, VectorDirection.LEFT_UP,
			VectorDirection.LEFT, VectorDirection.LEFT_DOWN, VectorDirection.DOWN, VectorDirection.RIGHT_DOWN]
		const centerX=this.getPosition().getX();
		const centerY=this.getPosition().getY();
		let dir = 0;
		for(let angle = 0; angle < 360; angle += 45, dir++)
		{
			const radians = angle *(Math.PI / 180);
			const x = centerX + this.radius * Math.cos(radians);
			const y = centerY + this.radius * Math.sin(radians);
			const hitPoint:Point = new Point(x, y);
			allPoints.set(directions[dir], hitPoint);
		}
		return allPoints;
	}

}