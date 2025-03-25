
export function findIntersectionWithVerticalLine(x1: number, y1: number, x2: number, y2: number, xVertical: number): number {
	let yResult = 0;

	if (x1 != x2) {
		const m = (y2 - y1) / (x2 - x1);
		const b = y1 - m * x1;
		yResult = m * xVertical + b;
	}
	
	return yResult;
}