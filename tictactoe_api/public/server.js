"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const websocket_1 = __importDefault(require("@fastify/websocket"));
const Client_1 = require("./Client");
const faker_1 = require("@faker-js/faker");
const static_1 = __importDefault(require("@fastify/static"));
const path_1 = __importDefault(require("path"));
const dbUtils_1 = require("./dbUtils");
const PORT = 3001;
const HOST = "0.0.0.0";
let friendClient = null;
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
        const client = new Client_1.Client(id, socket);
        (0, dbUtils_1.createPlayerInDB)(client.getId());
        console.log("Client connected. clientId:", client.getId());
        if (friendClient === null) {
            friendClient = client;
        }
        else {
            const sign = Math.random() < 0.5 ? "X" : "O";
            const friendSign = sign === "X" ? "O" : "X";
            client.setFriendClient(friendClient);
            client.setSign(sign);
            client.getSocket().send(JSON.stringify({
                gameSetup: true,
                userId: client.getId(),
                opponentId: friendClient.getId(),
                yourSign: sign,
                turn: client.getTurn(),
            }));
            friendClient.setFriendClient(client);
            friendClient.setSign(friendSign);
            friendClient.getSocket().send(JSON.stringify({
                gameSetup: true,
                userId: friendClient.getId(),
                opponentId: client.getId(),
                yourSign: friendSign,
                turn: friendClient.getTurn(),
            }));
            friendClient = null;
        }
        connection.on("message", (message) => {
            try {
                const data = JSON.parse(message);
                if (data.index !== undefined) {
                    const friend = client.getFriendClient();
                    if (friend) {
                        if (client.getTurn()) {
                            client.getSocket().send(JSON.stringify({
                                index: data.index,
                                sign: client.getSign(),
                            }));
                            friend.getSocket().send(JSON.stringify({
                                index: data.index,
                                sign: client.getSign(),
                            }));
                            client.setTurn(false);
                            friend.setTurn(true);
                        }
                        else {
                            client
                                .getSocket()
                                .send(JSON.stringify({ error: "Not your turn" }));
                        }
                    }
                }
            }
            catch (error) {
                console.error(error);
                socket.send(JSON.stringify({ error: "Something went wrong" }));
            }
        });
        connection.on("close", (code, reason) => {
            console.log("Client disconnected: clientId:", client.getId());
            const friend = client.getFriendClient();
            if (friend) {
                friend.getSocket().send(JSON.stringify({
                    gameOver: "Your friend has left the game",
                }));
                friend.getSocket().close();
            }
            else {
                friendClient = null;
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