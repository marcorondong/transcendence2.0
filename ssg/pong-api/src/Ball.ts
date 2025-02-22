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
	getBallHitBoxPoints(): Point[]
	{
		const allPoints: Point[] = [];
		const centerX=this.getPosition().getX();
		const centerY=this.getPosition().getY();
		for(let angle = 0; angle < 360; angle += 45)
		{
			const radians = angle *(Math.PI / 180);
			const x = centerX + this.radius * Math.cos(radians);
			const y = centerY + this.radius * Math.sin(radians);
			const hitPoint:Point = new Point(x, y);
			allPoints.push(hitPoint);
		}
		return allPoints;
	}
}