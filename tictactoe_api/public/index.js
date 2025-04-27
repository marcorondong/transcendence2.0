window.onload = function () {
    // const gamePage = document.getElementById('gamePage') as HTMLDivElement;
    var cells = document.querySelectorAll('.cell');
    var player1_name = document.getElementById('player1_name');
    var player2_name = document.getElementById('player2_name');
    var player1_wins = document.getElementById('player1_wins');
    var player1_losses = document.getElementById('player1_losses');
    var player1_draws = document.getElementById('player1_draws');
    var player1_total = document.getElementById('player1_total');
    var playWith = document.getElementById("playWith");
    var info = document.getElementById("info");
    var nickname_page = document.getElementById("nickname_page");
    var loading = document.getElementById("loading");
    var game_page = document.getElementById("game_page");
    var nickname_button = document.getElementById("nickname_button");
    var cancelButton = document.getElementById("cancelButton");
    // const rematchButton = document.getElementById('rematchButton') as HTMLButtonElement;
    // const leaveButton = document.getElementById('leaveButton')
    var hideAllPages = function () {
        var pages = [nickname_page, loading, game_page];
        pages.forEach(function (page) {
            if (page) {
                page.style.display = "none";
            }
        });
    };
    var showPage = function (page) {
        hideAllPages();
        page.style.display = 'block';
    };
    nickname_button.addEventListener("click", function () {
        var nicknameInput = document.getElementById("nickname_input");
        var nickname = nicknameInput.value.trim();
        if (nickname) {
            openSocket(nickname);
            showPage(loading);
        }
        else {
            alert("Please enter a valid nickname.");
        }
    });
    function openSocket(nickname) {
        var socket = new WebSocket("ws://".concat(window.location.hostname, ":").concat(window.location.port, "/tictactoe/").concat(nickname));
        console.log("Connecting to WebSocket server at ws://".concat(window.location.hostname, ":").concat(window.location.port, "/ws/").concat(nickname));
        cancelButton.addEventListener("click", function () {
            socket.close();
            showPage(nickname_page);
        });
        cells.forEach(function (cell) {
            cell.addEventListener("click", function (event) {
                var cell = event.target;
                var index = Number(cell.dataset.index);
                socket.send(JSON.stringify({ index: index }));
            });
        });
        // socket.onopen = () => {
        // 	socket.send(JSON.stringify({ nickname: nickname }));
        // };
        socket.onclose = function () {
            showPage(nickname_page);
        };
        socket.onerror = function (error) {
            alert("WebSocket error: ".concat(error));
        };
        socket.onmessage = function (event) {
            try {
                var data = JSON.parse(event.data);
                console.log(data);
                if (data.index !== undefined && data.sign !== undefined && data.turn !== undefined) {
                    cells[data.index].textContent = data.sign;
                    info.textContent = data.turn;
                }
                else if (data.gameSetup) {
                    cells.forEach(function (cell) {
                        cell.textContent = "";
                    });
                    playWith.textContent = "".concat(data.sign);
                    info.textContent = "".concat(data.turn);
                    player1_name.textContent = data.userId;
                    player2_name.textContent = data.opponentId;
                    player1_wins.textContent = data.wins;
                    player1_losses.textContent = data.losses;
                    player1_draws.textContent = data.draws;
                    player1_total.textContent = data.total;
                    showPage(game_page);
                }
                else if (data.gameOver) {
                    info.textContent = data.gameOver;
                    alert(data.gameOver);
                    showPage(nickname_page);
                }
                else if (data.warning) {
                    alert(data.warning);
                }
                else if (data.error) {
                    alert(data.error);
                }
                else {
                    alert("Invalid message received");
                }
            }
            catch (error) {
                alert("".concat(error));
            }
        };
    }
    showPage(nickname_page);
};
