import type { FastifyRequest } from "fastify";

export function checkCookie(request: FastifyRequest, socket: WebSocket) {
	const cookie = request.headers.cookie;
	const token = request.cookies.access_token;
	if (!cookie || !token) {
		socket.close(1008, "Missing cookie or access token");
		throw new Error("Missing cookie or access token");
	}
	return cookie;
}
