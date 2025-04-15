"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
class Client {
    id;
    socket;
    friendClient = null;
    sign;
    turn = false;
    constructor(id, socket, sign = "") {
        this.id = id;
        this.socket = socket;
        this.sign = sign;
    }
    getId() {
        return this.id;
    }
    getSocket() {
        return this.socket;
    }
    getFriendClient() {
        return this.friendClient;
    }
    getSign() {
        return this.sign;
    }
    getTurn() {
        return this.turn;
    }
    setFriendClient(friendClient) {
        this.friendClient = friendClient;
    }
    setSign(sign) {
        this.sign = sign;
        if (sign === "X") {
            this.turn = true;
        }
        else {
            this.turn = false;
        }
    }
    setTurn(turn) {
        this.turn = turn;
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map