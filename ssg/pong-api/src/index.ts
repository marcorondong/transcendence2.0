import Fastify from "fastify"

const PORT:number = 3010;
const HOST:string = "0.0.0.0"


const fastify = Fastify({logger: true});

fastify.register(async function(fastify)
{
	fastify.get("/", (request, reply) =>
	{
		reply.send(
			{
				hello: "Ping Pong server"
			}
		)
	})
})


const startServer = async() =>
{
	try 
	{
		await fastify.listen({port: PORT, host: HOST});
		console.log(`Pong server is runnig on http://${HOST}:${PORT}`);
	}
	catch(err)
	{
		console.log(err);
		process.exit(1);
	}
}

startServer();