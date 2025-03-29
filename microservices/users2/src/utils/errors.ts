export class AppError extends Error {
	constructor(
		public statusCode: number,
		public message: string,
		public code?: string, // custom error code
	) {
		super(message);
		this.name = "AppError";
	}
}