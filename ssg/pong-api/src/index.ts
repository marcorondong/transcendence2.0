import { Point } from "./Point";
import { Paddle } from "./Paddle";
const a = new Point(0,0);
const b = new Point(0,0);
if(a.equals(b))
{
	console.log("Equal points");
}
else 
{
	console.log("not same points");
}
console.log("Hello world")
console.log(a);

const left:Paddle = new Paddle(a);
console.log(left);
left.moveUp();
console.log(left);
left.moveUp();
console.log(left);
left.moveDown();
console.log(left);
