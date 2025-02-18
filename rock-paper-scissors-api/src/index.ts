import Fastify, { FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';
import websocket from "@fastify/websocket"


const PORT:number = 3000
const HOST:string = "0.0.0.0"
const fastify = Fastify( {logger:true});
const clients: Set<WebSocket> = new Set(); //set is just array but uniue values

function broadcastToAll(allClients: Set<WebSocket>, sender:WebSocket, message:string)
{
  for(const oneClient of clients)
  {
    if(oneClient !== sender && oneClient.readyState === WebSocket.OPEN)
    {
      oneClient.send(`Client says ${message}`)
    }
  }
}


// Register WebSocket plugin
fastify.register(websocket);
fastify.register(async function (fastify)
{
  // fastify.get("/", { websocket: true }, handleWebSocketConnection);
  // fastify.get("/ws/", {websocket:true}, anotherHandel);
  fastify.get("/ws", {websocket:true}, (connection, req) =>
  {
    console.log("Client connectd");
    clients.add(connection);
    connection.on("message", (message)=>
    {
      const messageStr = message.toString();
      broadcastToAll(clients, connection, messageStr);
      console.log("Received:", message.toString());
      //connection.send(`Echo: ${message}`)
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