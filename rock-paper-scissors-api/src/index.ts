import Fastify, { FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';
import websocket from "@fastify/websocket"
//import { SocketStream } from '@fastify/websocket';


const fastify = Fastify( {logger:true});


// Register WebSocket plugin
fastify.register(websocket);

fastify.register(async function (fastify)
{
  fastify.get("/", {websocket: true}, (socket: WebSocket, req:FastifyRequest) =>
  {
    socket.on("message", message =>
    {
      //message.toString() === 'hi from client'
      socket.send("Hi from server")
    }
    )
  })
})

// Start the server
fastify.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`WebSocket server running on ${address}/ws`);
});
