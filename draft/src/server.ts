
import myFastify, { FastifyReply, FastifyRequest } from 'fastify';
import userRoutes from './modules/user/user.route';
import fastifyBcrypt from 'fastify-bcrypt';
import fastifyJWT from '@fastify/jwt';
import { ZodTypeProvider, validatorCompiler, serializerCompiler, jsonSchemaTransform } from "fastify-type-provider-zod";

const PORT = 4000;
const HOST = '0.0.0.0';
const saltRounds = 10;

export const myFastifyServer = myFastify({
	logger: false
}).withTypeProvider<ZodTypeProvider>();

myFastifyServer.setValidatorCompiler(validatorCompiler);
myFastifyServer.setSerializerCompiler(serializerCompiler);

// for (const schema of [userSchemas.createUserSchema, userSchemas.createUserResponseSchema]) {
// 	myFastifyServer.addSchema(schema);
// }

myFastifyServer.register(fastifyJWT, {secret: 'this_is password_should_be_passed_with_docker_secret'});
myFastifyServer.decorate(
	'authenticate', 
	async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		await request.jwtVerify();
	} catch (err) {
		reply
			.code(401)
			.send({ message: 'Authentication required' });
	}
});
myFastifyServer.register(userRoutes, { prefix: "api/users" });

myFastifyServer.register(fastifyBcrypt, { saltWorkFactor: saltRounds });
export async function hashPassword(password: string) {
	const hashedPassword = await myFastifyServer.bcrypt.hash(password);
	return hashedPassword;
}
export async function verifyPassword(password: string, hashedPassword: string) {
	const isMatch = await myFastifyServer.bcrypt.compare(password, hashedPassword);
	return isMatch;
}


myFastifyServer.get('/healthcheck', async (request, reply) => {
	return { hello: 'healthy' };
});

const startServer = async () => {
	
	try {
		await myFastifyServer.listen({ port: PORT, host: HOST });
		console.log(`Server listening at ${PORT}`);
	} catch (err) {
		myFastifyServer.log.error(err);
		process.exit(1);
	}
};

startServer();