export class PongField {
	readonly TABLE_WIDTH_Y: number;
	readonly TABLE_LENGTH_X: number;
	readonly TOP_EDGE_Y: number;
	readonly BOTTOM_EDGE_Y: number;
	readonly RIGHT_EDGE_X: number;
	readonly LEFT_EDGE_X: number;

	constructor() {
		this.TABLE_WIDTH_Y = 5;
		this.TABLE_LENGTH_X = 9;
		this.TOP_EDGE_Y = this.TABLE_WIDTH_Y / 2;
		this.BOTTOM_EDGE_Y = (this.TABLE_WIDTH_Y / 2) * -1;
		this.RIGHT_EDGE_X = this.TABLE_LENGTH_X / 2;
		this.LEFT_EDGE_X = (this.TABLE_LENGTH_X / 2) * -1;
	}
}
