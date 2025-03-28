import { networkInterfaces } from 'os';
import { Point } from '../ssg/pong-api/src/game/Point';

export function findIntersectionWithVerticalLine(p1: Point, p2: Point, xVertical: number, yResult = 0): number {
	if (p1.getX() != p2.getX()) {
		const m = (p2.getY() - p1.getY()) / (p2.getX() - p1.getX());
		const b = p1.getY() - m * p1.getX();
		yResult = m * xVertical + b;
		console.log(`yResult: ${yResult} based on p1: ${p1.getX()}, ${p1.getY()} and p2: ${p2.getX()}, ${p2.getY()}\nm: ${m}, xVertical: ${xVertical} and b: ${b}`);
	}
	return yResult;
}

export function distanceBetweenPoints(p1: Point, p2: Point): number {
	return Math.sqrt(Math.pow(p1.getX() - p2.getX(), 2) + Math.pow(p1.getY() - p2.getY(), 2));
}

export function roundTo(n: number, decimals: number) :number {
	const multiplier = Math.pow(10, decimals);
	return Math.round(n * multiplier) / multiplier;
}
