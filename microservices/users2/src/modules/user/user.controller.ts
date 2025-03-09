import { FastifyReply, FastifyRequest } from "fastify";
import { createUserInput } from "./user.schema";
import { createUser } from "./user.service";

export async function registerUserHandler(
	request: FastifyRequest<{
		Body: createUserInput;
	}>,
	reply: FastifyReply
) {
	const body = request.body
	try{
		const user = await createUser(body);
		return reply.code(201).send(user);
	}catch(e) {
		console.log(e)
		// TODO: I should check what was the error and then return the correcr code.
		return reply.code(500).send(e);
	}
}