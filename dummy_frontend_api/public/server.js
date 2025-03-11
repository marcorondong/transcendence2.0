"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const websocket_1 = __importDefault(require("@fastify/websocket"));
const static_1 = __importDefault(require("@fastify/static"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const PORT = 3000;
const HOST = '0.0.0.0';
const fastify = (0, fastify_1.default)({ logger: false });
let allClients = [];
const chatHistories = {};
class Client {
    id;
    nickname;
    socket;
    blockedList = [];
    constructor(id, nickname, socket) {
        this.id = id;
        this.socket = socket;
        this.nickname = '';
    }
}
class Message {
    text;
    isOwn;
    constructor(text, isOwn) {
        this.text = text;
        this.isOwn = isOwn;
    }
}
function addMessage(sender, receiver, message) {
    if (!chatHistories[sender]) {
        chatHistories[sender] = {};
    }
    if (!chatHistories[sender][receiver]) {
        chatHistories[sender][receiver] = [];
    }
    if (message.text === '') {
        return;
    }
    chatHistories[sender][receiver].push(message);
}
const findClientByNickname = (nickname) => {
    for (const client of allClients.values()) {
        if (client.nickname === nickname) {
            return client;
        }
    }
    return undefined;
};
fastify.register(static_1.default, {
    root: path_1.default.join(__dirname, '../public'),
    prefix: '/',
});
fastify.register(websocket_1.default);
fastify.get('/', async (request, reply) => {
    return reply.sendFile('index.html');
});
fastify.register(async function (fastify) {
    fastify.get('/ws', { websocket: true }, (connection, req) => {
        const socket = connection;
        const id = (0, uuid_1.v4)();
        const currentClient = new Client(id, "", socket);
        connection.on('message', (message) => {
            const data = JSON.parse(message.toString());
            if (data.microservice) {
                if (data.microservice === 'chat') {
                    if (data.message) {
                        const receiver = findClientByNickname(data.receiver);
                        if (receiver && !receiver.blockedList.includes(currentClient.nickname)) {
                            const message = new Message(data.message, false);
                            addMessage(data.receiver, currentClient.nickname, message);
                            receiver.socket.send(JSON.stringify({ microservice: 'chat', message: data.message, sender: currentClient.nickname }));
                        }
                        const message = new Message(data.message, true);
                        addMessage(currentClient.nickname, data.receiver, message);
                        return;
                    }
                    else if (data.notification) {
                        const receiver = findClientByNickname(data.receiver);
                        if (receiver && !receiver.blockedList.includes(currentClient.nickname)) {
                            receiver.socket.send(JSON.stringify({ microservice: 'chat', notification: data.notification, sender: currentClient.nickname }));
                        }
                        return;
                    }
                    else if (data.chatHistoryRequest) {
                        if (!chatHistories[currentClient.nickname] || !chatHistories[currentClient.nickname][data.chattingWith]) {
                            const message = new Message('', false);
                            addMessage(currentClient.nickname, data.chattingWith, message);
                            socket.send(JSON.stringify({ microservice: 'chat', chatHistoryProvided: [], block: false }));
                            return;
                        }
                        const isBlocked = currentClient.blockedList.includes(data.chattingWith);
                        const chatHistory = chatHistories[currentClient.nickname][data.chattingWith];
                        socket.send(JSON.stringify({ microservice: 'chat', chatHistoryProvided: chatHistory, block: isBlocked }));
                        return;
                    }
                    else if (data.blockThisPerson) {
                        currentClient.blockedList.push(data.blockThisPerson);
                        socket.send(JSON.stringify({ microservice: 'chat', thisPersonBlocked: data.blockThisPerson }));
                        return;
                    }
                    else if (data.unblockThisPerson) {
                        currentClient.blockedList = currentClient.blockedList.filter(n => n !== data.unblockThisPerson);
                        socket.send(JSON.stringify({ microservice: 'chat', thisPersonUnblocked: data.unblockThisPerson }));
                        return;
                    }
                    else if (data.registerThisPerson) {
                        if (allClients.some(client => client.nickname === data.registerThisPerson)) {
                            socket.send(JSON.stringify({ microservice: 'chat', registrationDeclined: data.registerThisPerson + ' is already taken' }));
                            return;
                        }
                        const clientsOnline = Array.from(allClients.values()).map(client => ({ nickname: client.nickname }));
                        socket.send(JSON.stringify({ microservice: 'chat', registrationApproved: data.registerThisPerson, clientsOnline: clientsOnline }));
                        for (const client of allClients) {
                            client.socket.send(JSON.stringify({ microservice: 'chat', newClientOnline: data.registerThisPerson }));
                        }
                        currentClient.nickname = data.registerThisPerson;
                        allClients.push(currentClient);
                        return;
                    }
                    else if (data.inviteThisPerson) {
                        const invitee = findClientByNickname(data.inviteThisPerson);
                        if (invitee && !invitee.blockedList.includes(currentClient.nickname)) {
                            const message = new Message(data.message, false);
                            addMessage(data.receiver, currentClient.nickname, message);
                            invitee.socket.send(JSON.stringify({ microservice: 'chat', thisPersonInvitedYou: currentClient.nickname }));
                        }
                        return;
                    }
                    else if (data.invitationCanceled) {
                        const invitee = findClientByNickname(data.invitationCanceled);
                        if (invitee && !invitee.blockedList.includes(currentClient.nickname)) {
                            invitee.socket.send(JSON.stringify({ microservice: 'chat', invitationCanceled: currentClient.nickname }));
                        }
                        return;
                    }
                    else if (data.startGame) {
                        const invitee = findClientByNickname(data.startGame);
                        if (invitee && !invitee.blockedList.includes(currentClient.nickname)) {
                            invitee.socket.send(JSON.stringify({ microservice: 'chat', startGame: "http://10.14.5.2:3001/" }));
                            socket.send(JSON.stringify({ microservice: 'chat', startGame: "http://10.14.5.2:3001/" }));
                        }
                        return;
                    }
                    else if (data.error) {
                        return;
                    }
                    else {
                        console.log(JSON.stringify(data, null, 2));
                    }
                }
                else if (data.microservice === 'error') {
                    if (data.errorMessage && data.sentData) {
                        console.log(JSON.stringify(data.sentData, null, 2));
                    }
                    else {
                        console.log(JSON.stringify(data, null, 2));
                    }
                }
                else {
                    console.log(JSON.stringify(data, null, 2));
                }
            }
            else {
                console.log(JSON.stringify(data, null, 2));
            }
        });
        connection.on('close', (code, reason) => {
            allClients = allClients.filter(client => client !== currentClient);
            for (const client of allClients) {
                client.socket.send(JSON.stringify({ microservice: 'chat', clientDisconnected: true, nickname: currentClient.nickname }));
            }
        });
    });
});
const start = async () => {
    try {
        await fastify.listen({ port: PORT, host: HOST });
        const address = fastify.server.address();
        const port = typeof address === 'string' ? address : address?.port;
        console.log(`Server listening at ${port}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=server.js.map