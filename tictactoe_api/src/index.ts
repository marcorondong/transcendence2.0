

window.onload = () => 
{
	// const gamePage = document.getElementById('gamePage') as HTMLDivElement;
	const cells = document.querySelectorAll('.cell');
	const player1_name = document.getElementById('player1_name') as HTMLDivElement;
	const player2_name = document.getElementById('player2_name') as HTMLDivElement;
	const player1_wins = document.getElementById('player1_wins') as HTMLDivElement;
	const player1_losses = document.getElementById('player1_losses') as HTMLDivElement;
	const player1_draws = document.getElementById('player1_draws') as HTMLDivElement;
	const player1_total = document.getElementById('player1_total') as HTMLDivElement;
	const playWith = document.getElementById("playWith") as HTMLDivElement;
	const info = document.getElementById("info") as HTMLDivElement;
	const nickname_page = document.getElementById("nickname_page") as HTMLDivElement;
	const loading = document.getElementById("loading") as HTMLDivElement;
	const game_page = document.getElementById("game_page") as HTMLDivElement;
	const nickname_button = document.getElementById("nickname_button") as HTMLButtonElement;
	const cancelButton = document.getElementById("cancelButton") as HTMLButtonElement;
	// const rematchButton = document.getElementById('rematchButton') as HTMLButtonElement;
	// const leaveButton = document.getElementById('leaveButton')

	const hideAllPages = () => {
		const pages = [nickname_page, loading, game_page];
		pages.forEach((page) => {
			if (page) {
				page.style.display = "none";
			}
		});
	}

	const showPage = (page: HTMLElement) => // reviewed
	{
		hideAllPages();
		page.style.display = 'block';
	};

	nickname_button.addEventListener("click", () => {
		const nicknameInput = document.getElementById("nickname_input") as HTMLInputElement;
		const nickname = nicknameInput.value.trim();
		if (nickname) {
			openSocket(nickname);
			showPage(loading);
		} else {
			alert("Please enter a valid nickname.");
		}
	});

	function openSocket(nickname: string) {
		const socket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/tictactoe/${nickname}`);
		console.log(`Connecting to WebSocket server at ws://${window.location.hostname}:${window.location.port}/ws/${nickname}`);
		cancelButton.addEventListener("click", () => {
			socket.close();
			showPage(nickname_page);
		});

		cells.forEach((cell) => {
			cell.addEventListener("click", (event) => {
				const cell = event.target as HTMLDivElement;
				const index = Number(cell.dataset.index);
				socket.send(JSON.stringify({ index: index }));
			});
		});

		// socket.onopen = () => {
		// 	socket.send(JSON.stringify({ nickname: nickname }));
		// };

		socket.onclose = () => {
			showPage(nickname_page);
		};

		socket.onerror = (error) => {
			alert(`WebSocket error: ${error}`);
		};

		socket.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				console.log(data);
				if (data.index !== undefined && data.sign !== undefined && data.turn !== undefined) {
					cells[data.index].textContent = data.sign;
					info.textContent = data.turn;
				} else if (data.gameSetup) {
					cells.forEach((cell) => {
						cell.textContent = "";
					});
					playWith.textContent = `${data.sign}`;
					info.textContent = `${data.turn}`;
					player1_name.textContent = data.userId;
					player2_name.textContent = data.opponentId;
					player1_wins.textContent = data.wins;
					player1_losses.textContent = data.losses;
					player1_draws.textContent = data.draws;
					player1_total.textContent = data.total;
					showPage(game_page);
				} else if (data.gameOver) {
					info.textContent = data.gameOver;
					alert(data.gameOver);
					showPage(nickname_page);
				} else if (data.warning) {
					alert(data.warning);
				} else if (data.error) {
					alert(data.error);
				} else {
					alert("Invalid message received");
				}
			} catch (error) {
				alert(`${error}`);
			}
		};
	}

	showPage(nickname_page);

};
