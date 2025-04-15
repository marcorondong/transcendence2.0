"use strict";
const socket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/ws`);
window.onload = () => {
    const cells = document.querySelectorAll('.cell');
    const player1_name = document.getElementById('player1_name');
    const player2_name = document.getElementById('player2_name');
    const player1_score = document.getElementById('player1_score');
    const player2_score = document.getElementById('player2_score');
    const playWith = document.getElementById("playWith");
    const info = document.getElementById("info");
    cells.forEach((cell) => {
        cell.addEventListener("click", (event) => {
            const cell = event.target;
            const index = Number(cell.dataset.index);
            socket.send(JSON.stringify({ index: index }));
        });
    });
    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log(data);
            if (data.index !== undefined && data.sign !== undefined) {
                cells[data.index].textContent = data.sign;
            }
            else if (data.gameSetup) {
                playWith.textContent = `${data.yourSign}`;
                if (data.turn)
                    info.textContent = `Your turn`;
                else
                    info.textContent = `Opponent's turn`;
                player1_name.textContent = data.userId;
                player2_name.textContent = data.opponentId;
            }
            else if (data.gameOver) {
                alert(data.gameOver);
            }
            else if (data.error) {
                alert(data.error);
            }
            else {
                alert("Invalid message received");
            }
        }
        catch (error) {
            alert(`${error}`);
        }
    };
};
//# sourceMappingURL=index.js.map