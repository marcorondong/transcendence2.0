// console.log('hello world');
import fastify, { FastifyInstance } from "fastify";
import { request } from "http";

// Create fastify server
const app: FastifyInstance = fastify(
	{logger: true}
);

// Register first route
app.get("/", async (request, reply) => {
	return {hello: "world modified"};
});

app.listen({ port: 3000 }, (err, address) => {
	if (err) {
		app.log.error(err);
		process.exit(1);
	}
	app.log.info(`server listening on ${address}`);
});