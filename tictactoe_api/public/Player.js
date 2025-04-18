"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const Game_1 = require("./Game");
class Player {
    id;
    socket;
    opponentPlayer = null;
    sign = "";
    game = null;
    constructor(id, socket) {
        this.id = id;
        this.socket = socket;
    }
    getId() {
        return this.id;
    }
    getSocket() {
        return this.socket;
    }
    getOpponentPlayer() {
        return this.opponentPlayer;
    }
    getSign() {
        return this.sign;
    }
    getGame() {
        return this.game;
    }
    getOpponentId() {
        if (this.opponentPlayer) {
            return this.opponentPlayer.getId();
        }
        return null;
    }
    sendSetup() {
        console.log("sign:", this.sign, "\nturn:", this.getTurn());
        this.socket.send(JSON.stringify({
            gameSetup: true,
            userId: this.id,
            opponentId: this.getOpponentId(),
            sign: this.sign,
            turn: this.getTurn(),
        }));
    }
    finishSetup(opponentPlayer) {
        const sign = Math.random() < 0.5 ? "X" : "O";
        const game = new Game_1.Game();
        this.opponentPlayer = opponentPlayer;
        this.sign = sign;
        this.game = game;
        opponentPlayer.opponentPlayer = this;
        opponentPlayer.sign = sign === "X" ? "O" : "X";
        opponentPlayer.game = game;
        if (sign === "X") {
            this.game.setCurrentTurn(this);
        }
        else {
            this.game.setCurrentTurn(opponentPlayer);
        }
        this.sendSetup();
        opponentPlayer.sendSetup();
    }
    getTurn() {
        if (this.game?.getCurrentTurn() === this)
            return "Your turn";
        else
            return "Opponent's turn";
    }
    changeTurn() {
        if (this.opponentPlayer)
            this.game?.setCurrentTurn(this.opponentPlayer);
    }
    sendIndex(index) {
        if (this.opponentPlayer) {
            if (this.game?.setBoard(index, this)) {
                this.changeTurn();
                this.socket.send(JSON.stringify({
                    index: index,
                    sign: this.sign,
                    turn: this.getTurn(),
                }));
                this.opponentPlayer.getSocket().send(JSON.stringify({
                    index: index,
                    sign: this.sign,
                    turn: this.opponentPlayer.getTurn(),
                }));
                this.game?.checkWin(this);
            }
        }
    }
}
exports.Player = Player;
//# sourceMappingURL=Player.js.map