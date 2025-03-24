import { FastifyReply, FastifyRequest } from "fastify";
import { createUser, findUserByEmail, verifyPassword, generateAccessToken, findUsers } from "./user.service";
import { CreateUserInput, loginInput } from "./user.schema";


export async function registerUserHandler(
	request: FastifyRequest<{
	  Body: CreateUserInput;
	}>,
	reply: FastifyReply
  ) {
	const body = request.body;
  
	try {
	  const user = await createUser(body, reply);
	  
	  return reply.code(201).send(user);
	} catch (e) {
	  console.log(e);
	  return reply.code(500).send(e);
	}
  }

export async function loginHandler(request: FastifyRequest<{Body: loginInput}>, reply: FastifyReply) 
{
	const body = request.body;

	const user = await findUserByEmail(body.email);
	if (!user) {
		return reply.code(401).send({
			message: 'Invalid email or password',
		})
	}

	const isMatch = await verifyPassword(body.password, user.password);
	if (!isMatch) {
		return reply.code(401).send({
			message: 'Invalid email or password',
		})
	}

	
	const accessToken = await generateAccessToken(user);
	return reply.code(200).send({ message: 'Login successful', accessToken: accessToken });
}

export async function getUsersHandler() {
	const users = await findUsers();

	return users;
}