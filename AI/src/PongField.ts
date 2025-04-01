export class PongField
{
	readonly TABLE_WIDTH_Y: number = 5;
	readonly TABLE_LENGHT_X: number = 9;
	readonly TOP_EDGE_Y:number = this.TABLE_WIDTH_Y/2;
	readonly BOTTOM_EDGE_Y:number = (this.TABLE_WIDTH_Y/2) * (-1);
	readonly RIGHT_EDGE_X = this.TABLE_LENGHT_X/2;
	readonly LEFT_EDGE_X = (this.TABLE_LENGHT_X/2) * (-1);

	constructor()
	{

	}
}