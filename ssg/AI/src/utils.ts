import { networkInterfaces } from "os";
import { Point } from "./Point";

export function findIntersectionWithVerticalLine(
	p1: Point,
	p2: Point,
	xVertical: number,
	yResult = 0,
): number {
	if (p1.getX() != p2.getX()) {
		const m = (p2.getY() - p1.getY()) / (p2.getX() - p1.getX());
		const b = p1.getY() - m * p1.getX();
		yResult = m * xVertical + b;
	}
	return roundTo(yResult, 2);
}

export function distanceBetweenPoints(p1: Point, p2: Point): number {
	return Math.sqrt(
		Math.pow(p1.getX() - p2.getX(), 2) + Math.pow(p1.getY() - p2.getY(), 2),
	);
}

export function roundTo(n: number, decimals: number): number {
	const multiplier = Math.pow(10, decimals);
	return Math.round(n * multiplier) / multiplier;
}

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
