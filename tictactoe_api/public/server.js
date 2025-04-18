"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const websocket_1 = __importDefault(require("@fastify/websocket"));
const Player_1 = require("./Player");
const faker_1 = require("@faker-js/faker");
const static_1 = __importDefault(require("@fastify/static"));
const path_1 = __importDefault(require("path"));
const dbUtils_1 = require("./dbUtils");
const PORT = 3001;
const HOST = "0.0.0.0";
let game = null;
let friendPlayer = null;
const fastify = (0, fastify_1.default)({ logger: false });
fastify.register(static_1.default, {
    root: path_1.default.join(__dirname, "../public"),
    prefix: "/",
});
fastify.register(websocket_1.default);
fastify.get("/", async (request, reply) => {
    return reply.sendFile("tictactoe.html");
});
fastify.register(async function (fastify) {
    fastify.get("/ws", { websocket: true }, (connection, req) => {
        const id = faker_1.faker.person.firstName();
        const socket = connection;
        const player = new Player_1.Player(id, socket);
        (0, dbUtils_1.createPlayerInDB)(player.getId());
        console.log("Player connected. playerId:", player.getId());
        if (friendPlayer) {
            const opponent = friendPlayer;
            friendPlayer = null;
            player.finishSetup(opponent);
        }
        else {
            friendPlayer = player;
        }
        connection.on("message", (message) => {
            try {
                const data = JSON.parse(message);
                if (data.index !== undefined) {
                    player.sendIndex(data.index);
                }
            }
            catch (error) {
                console.error(error);
                socket.send(JSON.stringify({ error: "Something went wrong" }));
            }
        });
        connection.on("close", (code, reason) => {
            console.log("player disconnected: playerId:", player.getId());
            const friend = player.getOpponentPlayer();
            if (friend) {
                friend.getSocket().send(JSON.stringify({
                    gameOver: "Your friend has left the game",
                }));
                friend.getSocket().close();
            }
            else {
                friendPlayer = null;
            }
        });
    });
});
const start = async () => {
    try {
        await fastify.listen({ port: PORT, host: HOST });
        console.log(`Server listening at ${PORT}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=server.js.map