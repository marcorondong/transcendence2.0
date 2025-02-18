import Fastify, { FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';
import websocket from "@fastify/websocket"
import { Socket } from 'dgram';


const PORT:number = 3000
const HOST:string = "0.0.0.0"
let generateId = 0;
const CLOSE_CODE:number = 1000
const fastify = Fastify( {logger:true});
const clients: Set<WebSocket> = new Set(); //set is just array but uniue values

const players: Map<number, WebSocket> = new Map();

function broadcastToAll(allClients: Map<number, WebSocket>, sender:number, message:string)
{
  for(const [id, oneClient] of allClients)
  {
    if(id !== sender && oneClient.readyState === WebSocket.OPEN)
    {
      oneClient.send(`Client ${id} says ${message}`)
    }
  }
}

function sendPrivateMessage(senderId: number, receiverId: number, message:string)
{
  const reciverSocket = players.get(receiverId);
  if(reciverSocket && reciverSocket.readyState === WebSocket.OPEN && receiverId!==senderId)
  {
    reciverSocket.send(`Private from ${senderId}: ${message}`);
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
    const clienId = generateId++;
    console.log(`Client connectd ${clienId}`);
    connection.send(`Hello client ${clienId}`);
    //clients.add(connection);
    players.set(clienId, connection);
    //connection.close(CLOSE_CODE, "Necu te")
    connection.on("message", (message)=>
    {
      const messageStr = message.toString();
      console.log("Received:", message.toString());
      
      try 
      {
        const data = JSON.parse(messageStr);
        if(data.type === 'private' && data.to)
        {
          sendPrivateMessage(clienId, data.to, data.message);
        }
        else
        {
          broadcastToAll(players, clienId, messageStr);
        }
      }
      catch(error)
      {
        connection.send('Invalid message format. Send JSON with type, message, and optional to.');
      }
      //connection.send(`Echo: ${message}`)
    })

    connection.on("close", (code:number, reason:Buffer) =>
    {
      console.log(`Client ${clienId} disconnected`);
      console.log(`Reason ${code} buffer: ${reason}`)
      players.delete(clienId);
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