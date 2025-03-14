import Fastify from "fastify"
import websocket from "@fastify/websocket"
import { WebSocket, RawData } from "ws";
import fs from "fs"
import path from 'path';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv'
import { PongPlayer } from "./PongPlayer";
import { SingleMatchMaking } from "./SingleMatchMaking";
import { TournamentMatchMaking } from "./TournamentMatchMaking";
import { TValidTournamentSize } from "./Tournamnet";

dotenv.config();

//Server set up variables
const PORT:number = 3010;
const HOST:string = "0.0.0.0"
const privateKeyPath:string = path.join(__dirname, "../server-keys/key.pem")
const certificatePath:string = path.join(__dirname, "../server-keys/cert.pem")
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
	
function spectatorJoin(roomId:string | 0, connection:WebSocket) :boolean
{
	if(roomId === 0)
		return false;
	const roomWithId = singlesManager.getRoom(roomId);
	if(roomWithId !== undefined)
	{
		roomWithId.addSpectator(connection);
		return true
	}
	return false;
}


const singlesManager:SingleMatchMaking = new SingleMatchMaking();
const tournamentManager:TournamentMatchMaking = new TournamentMatchMaking();


fastify.register(fastifyStatic, {
	root: path.join(process.cwd(), "src/public"), // Ensure this path is correct
	prefix: "/", // Optional: Sets the URL prefix
  });

interface GameRoomQueryI
{
	roomId: string | 0;
	playerId: string;
	privateRoom: boolean;
	clientType: "player" | "spectator";
	matchType: "single" | "tournament";
	tournamentSize: TValidTournamentSize;
} 


function spectatorLogic(roomId:string | 0, connection:WebSocket)
{
	if(spectatorJoin(roomId, connection))
	{
		console.log(`Spectator joined to room: ${roomId}`)
		connection.send(JSON.stringify(roomId));
	}
	else 
	{
		connection.send(`Room: ${roomId} you tried to join does not exist`);
		connection.close();
	}
}

function tournamentJoiner(connection:WebSocket, tournamentSizeQuerry:TValidTournamentSize)
{
	const player:PongPlayer = new PongPlayer(connection);
	tournamentManager.putPlayerInTournament(player, tournamentSizeQuerry);
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
	fastify.get<{Querystring: Partial<GameRoomQueryI>}>("/pong/", {websocket:true}, (connection, req) =>
	{
		const {
			roomId = 0,
			playerId= "Player whatever",
			privateRoom = false,
			clientType = "player",
			matchType = "single",
			tournamentSize = 4 //TODO: check client queryy. It must be one of valid values. Correct it if it is not' only if matchType is tournament
		} = req.query as GameRoomQueryI;
		if(matchType === "single")
		{
			const player:PongPlayer = new PongPlayer(connection);
			singlesManager.putPlayerinRandomRoom(player);
			console.log("Single match activated");
		}
		else if(matchType === "tournament")
			tournamentJoiner(connection, tournamentSize);

	})

	fastify.get("/pingpong/", async (request, reply) => {
		const filePath = path.join(process.cwd(), "src/public/pong.html");
		console.log(`Serving file from: ${filePath}`);
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