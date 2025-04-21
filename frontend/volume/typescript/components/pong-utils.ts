export function printMessage(
	message: string,
	ctx: CanvasRenderingContext2D | null,
	canvasWidth: number,
	canvasHeight: number,
) {
	if (!ctx) {
		return;
	}
	ctx.globalAlpha = 0.7;
	ctx.fillStyle = "rgb(0 0 0)";
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);
	printTextCentered(message, ctx, canvasWidth / 2, canvasHeight / 2);
}

export function printTextCentered(
	message: string,
	ctx: CanvasRenderingContext2D | null,
	canvasWidthHalf: number,
	canvasHeightHalf: number,
) {
	if (!ctx) {
		return;
	}
	console.log("trying to print: ", message);
	ctx.globalAlpha = 1;
	ctx.fillStyle = "rgb(240 240 240)";
	const fontSize = 28;
	ctx.font = `${fontSize}px sans-serif`;
	ctx.textAlign = "center";
	ctx.fillText(message, canvasWidthHalf, canvasHeightHalf);
}
