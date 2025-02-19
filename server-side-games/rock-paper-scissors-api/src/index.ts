import Fastify, { FastifyRequest } from 'fastify';
import websocket from "@fastify/websocket"
import {Player} from "../../utils/Player"
import {RpsRoom} from "./RpsRoom"
import { RawData } from 'ws';

import fs from "fs"
import path from 'path';
import fastifyStatic from '@fastify/static';




const PORT:number = 3000
const HOST:string = "0.0.0.0"
let generateId = 0;
const fastify = Fastify( {logger:true});

const oneRoom:RpsRoom = new RpsRoom("1");

fastify.register(fastifyStatic, {
  root: path.join(process.cwd(), "src/public"), // Ensure this path is correct
  prefix: "/", // Optional: Sets the URL prefix
});
// Register WebSocket plugin
fastify.register(websocket);
fastify.register(async function (fastify)
{
  fastify.get("/ws", {websocket:true}, (connection, req) =>
  {
    const clienId = generateId++;
    const player1:Player = new Player(clienId.toString(), connection);
    console.log(`Loggin player info ${player1.id}`)

    addPlayerToRoom(oneRoom, player1)

    connection.on("message", (message:RawData)=>
    {
      onMessageHandler(message, oneRoom, player1);
    })

    connection.on("close", (code:number, reason:Buffer) =>
    {
      console.log(`Client ${clienId} disconnected`);
      console.log(`Reason ${code} buffer: ${reason}`)
      oneRoom.removePlayer(player1);
    })
  })

  
  fastify.get("/rps/", async (request, reply) => {
    const filePath = path.join(process.cwd(), "src/public/rps.html");
    console.log(`Serving file from: ${filePath}`);
    if (fs.existsSync(filePath)) {
      return reply.sendFile("rps.html"); // Serve public/index.html
    } else {
      reply.status(404).send({ error: "File not found" });
    }
  });

  fastify.get("/", (request, reply) =>
  {
    reply.send(
      {
        hello: "good"
      }
    )
  })
});

function addPlayerToRoom(rpsRoom:RpsRoom, player:Player): void
{
  const successJoin:boolean = rpsRoom.addPlayer(player); 
  if(successJoin === false)
  {
    player.connection.send("Cannot join full room");
    player.connection.close(1000, "Full room");
  }
  rpsRoom.greetPlayer(player);
  if(rpsRoom.isFull())
    rpsRoom.roomBroadcast("Ready to play");
}

function onMessageHandler(message:RawData, room:RpsRoom, player:Player )
{
    const messageStr = message.toString();
    console.log("Received:", message.toString());
    room.storeMove(player, messageStr);
    room.announceWinner();
}

const startServer = async() =>
{
  try 
  {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`Server is running on http://${HOST}:${PORT}`);
  }
  catch(err)
  {
    console.error(err);
    process.exit(1);
  }
}

startServer()