"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
class Game {
    currentTurn = null;
    board = Array(9).fill("");
    getCurrentTurn() {
        return this.currentTurn;
    }
    getBoard() {
        return this.board;
    }
    setCurrentTurn(player) {
        this.currentTurn = player;
    }
    sendWarning(player, message) {
        player.getSocket().send(JSON.stringify({
            warning: message,
        }));
    }
    sendError(player, message) {
        player.getSocket().send(JSON.stringify({
            error: message,
        }));
    }
    sendGameOver(player, message) {
        player.getSocket().send(JSON.stringify({
            gameOver: message,
        }));
    }
    checkWin(player) {
        const opponent = player.getOpponentPlayer();
        if (!opponent) {
            return this.sendError(player, "Opponent not found");
        }
        const winningCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (const combination of winningCombinations) {
            const [a, b, c] = combination;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.sendGameOver(player, `You win!`);
                this.sendGameOver(opponent, `You lose!`);
                player.getSocket().close();
                opponent.getSocket().close();
                return;
            }
        }
        if (this.board.every((cell) => cell !== "")) {
            this.sendGameOver(player, "It's a draw!");
            this.sendGameOver(opponent, "It's a draw!");
            player.getSocket().close();
            opponent.getSocket().close();
            return;
        }
    }
    setBoard(index, player) {
        if (this.currentTurn !== player) {
            this.sendWarning(player, "Not your turn");
            return false;
        }
        if (this.board[index] !== "") {
            this.sendWarning(player, "Cell already occupied");
            return false;
        }
        if (index < 0 || index > 8) {
            this.sendError(player, "Invalid cell");
            return false;
        }
        this.board[index] = player.getSign();
        return true;
    }
}
exports.Game = Game;
//# sourceMappingURL=Game.js.map