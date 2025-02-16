import Fastify from "fastify"
import {Choice,RPSGame,RpsShape} from "./rps"
import { err, req } from "pino-std-serializers";
import fastifyStatic from "@fastify/static";
import path from "path";
import fs from "fs"

const PORT:number = 3000;
const HOST:string = "0.0.0.0";

const fastify = Fastify(
  {
    logger: true
  }
);

fastify.addHook("onReady", async () =>
{
  console.log("Fastify instance is ready");
})

fastify.addHook("onSend", async(error)=>
{
  console.log("Response send to client")
})

fastify.register(fastifyStatic, {
  root: path.join(process.cwd(), "src/public"), // Ensure this path is correct
  prefix: "/", // Optional: Sets the URL prefix
});

fastify.get("/html/", async (request, reply) => {
  const filePath = path.join(process.cwd(), "src/public/index.html");
  console.log(`Serving file from: ${filePath}`);
  if (fs.existsSync(filePath)) {
    return reply.sendFile("index.html"); // Serve public/index.html
  } else {
    reply.status(404).send({ error: "File not found" });
  }
});

fastify.get("/html2/", async (request, reply) => {
  const filePath = path.join(process.cwd(), "src/public/index2.html");
  console.log(`Serving file from: ${filePath}`);
  if (fs.existsSync(filePath)) {
    return reply.sendFile("index2.html"); // Serve public/index.html
  } else {
    reply.status(404).send({ error: "File not found" });
  }
});

fastify.get("/", (request, repy) =>
{
  repy.send(
    {
      hello: "world"
    }
  )
})

fastify.get("/v1/rpsgame/", (request, reply)=>
{
  console.log("Game requested");
  reply.send(
    {
      winner: "player1"
    })
})

interface GreetQuery
{
  name: string;
}
fastify.get("/greet", async (request, reply) =>
{
  const query = request.query as GreetQuery;
  const name  = query.name;
  return {message: `hello, ${name}`}
})

interface Submit{
  name: string,
  age: number
}

fastify.post("/submit", async (request, reply) => {

  try{
    const reqBody: Submit = request.body as Submit;

    console.log(request.body);
    const { name, age } = reqBody;
    return { message: `Name: ${name}, Age: ${age}` };
  } catch(error)
  {
    console.error("Error happend");
    console.error(error)
    reply.status(500)
    reply.send(error)
  }
});

interface RPSMove{
  playerId: number,
  move: RpsShape,
  played: boolean
}

interface GameRound{
  player1: RPSMove,
  player2: RPSMove
}

const gameses: GameRound = {
  player1: {playerId: 1, move: "rock", played: false},
  player2: {playerId: 1, move: "rock", played: false},
};
fastify.post("/stupid/player1/", async (request, reply) =>
{
  try{
    const reqBody: RPSMove = request.body as RPSMove;
    const playerMove = reqBody.move;
    const playerId = reqBody.playerId;
    gameses.player1 = reqBody;
    gameses.player1.played = true;
    const winner = await getWinner(gameses)
    return{
      message: `You are player ${playerId} You played ${playerMove} and your oponent ${gameses.player2.move} you are player1, winner is ${winner}`
    }

  }
  catch(error)
  {
    return {
      error: error
    }
  }
});

fastify.post("/stupid/player2/", async (request, reply) =>
{
    try{
      const reqBody: RPSMove = request.body as RPSMove;
      const playerMove = reqBody.move;
      const playerId = reqBody.playerId;
      gameses.player2 = reqBody;
      gameses.player2.played = true;
      const winner = await getWinner(gameses)
      return{
        message: `You are player ${playerId} You played ${playerMove} and your oponent ${gameses.player1.move} you are player2, winner is ${winner}`
      }
  
    }
    catch(error)
    {
      return {
        error: error
      }
    }
});


async function getWinner(round: GameRound): Promise<string> {
  return new Promise<string>((resolve) => {
    const interval = setInterval(() => {
      if (!round.player1.played) return;
      if (!round.player2.played) return;

      clearInterval(interval); // Stop checking once both moves are made

      const player1 = new Choice(round.player1.move);
      const player2 = new Choice(round.player2.move);
      const winner = RPSGame.getWinner(player1, player2);

      resolve(winner === 0 ? "Draw" : `Winner is player ${winner}`);
    }, 100); // Check every 100ms
  });
}

fastify.get("/result/", async(request, reply) => 
{
  try 
  {
    const winner = await getWinner(gameses);
    reply.send(
    {
      winner: winner
    })
  }
  catch(errr)
  {
    reply.send(
      {
        status: errr
      }
    )
  }
})

fastify.listen(
  {
    port: PORT,
    host: HOST
  }
)

//console.log(rock.shape);