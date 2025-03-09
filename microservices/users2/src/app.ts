// console.log("hello world");
import Fastify from "fastify";
import userRoutes from "./modules/user/user.route";

const server = Fastify();

server.get('/healthcheck', async function() {
	return {status: "OK"};
});

async function main() {
	server.register(userRoutes, {prefix: 'api/users'})
	try{
		await server.listen( {port: 3000, host: "0.0.0.0"});
		console.log('Server ready at http://localhost:3000');
	} catch(e) {
		console.error(e);
		process.exit(1);
	}
}

main()