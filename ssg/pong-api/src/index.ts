import Fastify from "fastify"
import websocket from "@fastify/websocket"
import fs from "fs"
import path from 'path';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv'
import { MatchMaking } from "./match-making/MatchMaking";
import { Tournament } from "./game/modes/singles/Tournament";

dotenv.config();

//Server set up variables
const PORT: number = 3010;
const HOST: string = "0.0.0.0"
const privateKeyPath: string = path.join(__dirname, "../server-keys/key.pem")
const certificatePath: string = path.join(__dirname, "../server-keys/cert.pem")
let privateKey: string; 
let certificate: string;

try 
{
	privateKey = fs.readFileSync(privateKeyPath, "utf-8");
	certificate = fs.readFileSync(certificatePath, "utf-8");
}
catch
{
	console.error("ssl private key and certificate are not generated. Run https-key.sh script inside scripts folder first")
	process.exit(1);
	
}

const fastify = Fastify(
{
	https:
	{
		key: privateKey,
		cert: certificate
	},
	
	logger: process.env.NODE_ENV === "development"?
	{
		transport:
		{
			target: "pino-pretty",
			options:
			{
				colorize: true, //enables colors
				translateTime: "HH:MM:ss Z", //formating timestamt
				ignore: "pid,hostname" //Hide fields
			}
		}
	}
	: true
});
	
const manager: MatchMaking = new MatchMaking();

fastify.register(fastifyStatic, {
	root: path.join(process.cwd(), "src/public"), // Ensure this path is correct
	prefix: "/", // Optional: Sets the URL prefix
  });


export interface IGameRoomQuery
{
	roomId: string | 0;
	playerId: string;
	privateRoom: boolean;
	clientType: "player" | "spectator";
	matchType: "singles" | "tournament" | "doubles";
	tournamentSize: number;
} 

fastify.register(websocket);
fastify.register(async function(fastify)
{
	fastify.get("/", (request, reply) =>
	{
		reply.send(
		{
			hello: "ssl"
		}
		)
	});

	//Partial makes all field optional. 
	fastify.get<{Querystring: Partial<IGameRoomQuery>}>("/pong/", {websocket: true}, (connection, req) =>
	{
		const {
			roomId = 0,
			playerId= "Player whatever",
			privateRoom = false,
			clientType = "player",
			matchType = "singles",
			tournamentSize = Tournament.getDefaultTournamentSize()
		} = req.query as IGameRoomQuery;

		const gameQuery: IGameRoomQuery =
		{
			roomId,
			playerId,
			privateRoom,
			clientType, 
			matchType,
			tournamentSize
		}
		manager.matchJoiner(connection,gameQuery);
	})

	fastify.get("/pingpong/", async (request, reply) => {
		const filePath = path.join(process.cwd(), "src/public/pong.html");
		if (fs.existsSync(filePath)) {
		  return reply.sendFile("pong.html"); // Serve public/index.html
		} else {
		  reply.status(404).send({ error: "File not found" });
		}
	  });
})

const startServer = async() =>
{
	try 
	{
		await fastify.listen({port: PORT, host: HOST});
		console.log(`Pong server is runnig on https://${HOST}:${PORT}`);
	}
	catch(err)
	{
		console.log(err);
		process.exit(1);
	}
}

startServer();