import { WebSocket, RawData } from "ws";

const ws = new WebSocket('wss://localhost:3010/pong/', {rejectUnauthorized: false });

ws.on('open', () => {
    console.log('Connected to Pong WebSocket server');
});

ws.on('message', (data) => {
    try {
        const gameState = JSON.parse(data.toString());

        const ballY = gameState.ball.y;
        const paddleY = gameState.rightPaddle.y;

        let moveCommand;

        if (paddleY < ballY) {
            moveCommand = { move: "up", paddle: "right" };
        } else if (paddleY > ballY) {
            moveCommand = { move: "down", paddle: "right" };
        }

        if (moveCommand) {
            ws.send(JSON.stringify(moveCommand));
            console.log('Sent:', moveCommand);
        }
    } catch (error) {
        console.error('Error parsing message:', error);
    }
});

ws.on('close', () => {
    console.log('Disconnected from server');
});
