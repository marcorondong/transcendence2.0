import {findIntersectionWithVerticalLine} from './src/geometryUtils';
import {Point} from '../ssg/pong-api/src/game/Point';

test('decreasing lines', () =>
{

	const p1 = new Point(0, 0);
	const p2 = new Point(1, -1);
	let xVertical = 10;
	let result = findIntersectionWithVerticalLine(p1, p2, xVertical);

	
	let expectedY = -10;
	expect(result).toBeCloseTo(expectedY, 5); // Allowing small floating-point errors
	p1.setX(9);
	p1.setY(-9);
	p2.setX(10);
	p2.setY(-10);
	result = findIntersectionWithVerticalLine(p1, p2, xVertical);
	expect(result).toBeCloseTo(expectedY, 5); // Allowing small floating-point errors
	
	const p3 = new Point(-4, 0);
	const p4 = new Point(-0.16869485911539864, -1.1493915422653818);
	xVertical = 4;
	result = findIntersectionWithVerticalLine(p3, p4, xVertical);
	expectedY = -2.4;
	
	expect(result).toBeCloseTo(expectedY, 5); // Allowing small floating-point errors


});


test('increasing lines', () =>
{

});


test('even lines', () =>
{

});

test('vertical lines', () =>
{

});