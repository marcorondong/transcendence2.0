import { FastifyReply } from "fastify";
import { liveClients } from "../../index";

export async function warningReply(
	userName: string,
	errorMessage: string,
	reply: FastifyReply,
	code: number,
) {
	const client = liveClients.has(userName);
	if (!client) {
		console.log(errorMessage);
	}
	reply.code(409).send(errorMessage);
}
