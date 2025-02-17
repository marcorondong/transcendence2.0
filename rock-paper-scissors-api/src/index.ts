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
  fastify.get("/", { websocket: true }, handleWebSocketConnection);
  fastify.get("/ws/", {websocket:true}, anotherHandel);
});


function anotherHandel(socket: WebSocket, req: FastifyRequest)
{
  socket.on("message", stupid(socket))
}

function handleWebSocketConnection(socket: WebSocket, req: FastifyRequest)
{
  socket.on("message", handleClientMessage(socket));
  socket.on("close", handleclose);
}

function handleclose(code:number, reason:string)
{
  console.log(`client disconnected. Code: ${code}, Reason: ${reason}`)
};

function stupid(socket:WebSocket)
{
  return (message: MessageEvent) =>
    {
      const clientMesssage = message.toString();
      console.log("Recevided from client on ws:", clientMesssage);
  
      socket.send(`Hi from Server you move tr ${clientMesssage} received`);
    }
}

function handleClientMessage(socket: WebSocket)
{
  return (message: MessageEvent) =>
  {
    const clientMesssage = message.toString();
    console.log("Recevided from client:", clientMesssage);

    socket.send(`Hi from Server you move ${clientMesssage} received`);
  }
}

// Start the server
fastify.listen({ port: PORT, host: HOST }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`WebSocket server running on ${address}/ws`);
});
