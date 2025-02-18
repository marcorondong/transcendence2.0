import Fastify, { FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';
import websocket from "@fastify/websocket"


const PORT:number = 3000
const HOST:string = "0.0.0.0"
const fastify = Fastify( {logger:true});


// Register WebSocket plugin
fastify.register(websocket);
fastify.register(async function (fastify)
{
  // fastify.get("/", { websocket: true }, handleWebSocketConnection);
  // fastify.get("/ws/", {websocket:true}, anotherHandel);
  fastify.get("/wss", {websocket:true}, (connection, req) =>
  {
    console.log("Client connectd");
    connection.on("message", (message)=>
    {
      console.log("Received:", message.toString());
      connection.send(`Echo: ${message}`)
    })

    connection.on("close", (code:number, reason:Buffer) =>
    {
      console.log("Client disconnected");
      console.log(`Reason ${code} buffer: ${reason}`)
    })
  })

  fastify.get("/normal", (request, reply) =>
  {
    reply.send(
      {
        hello: "good"
      }
    )
  })

});

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