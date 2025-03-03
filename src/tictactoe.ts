const socket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/ws`);

window.onload = () =>
{

const board = ["", "", "", "", "", "", "", "", ""];
let gameActive = true;
let player1Score = 0;
let player2Score = 0;
let youAre = 'X';
let opponent = 'O';

// Nickname page
const nickname_page = document.getElementById('nickname_page') as HTMLDivElement;
const nickname_input = document.getElementById('nickname_input') as HTMLInputElement;
const nickname_button = document.getElementById('nickname_button') as HTMLButtonElement;
const me = document.getElementById('me') as HTMLDivElement;

// Game page
const gamePage = document.getElementById('gamePage') as HTMLDivElement;
const cells = document.querySelectorAll('.cell');
const player1_name = document.getElementById('player1_name') as HTMLDivElement;
const player2_name = document.getElementById('player2_name') as HTMLDivElement;
const player1_score = document.getElementById('player1_score') as HTMLDivElement;
const player2_score = document.getElementById('player2_score') as HTMLDivElement;
const playWith = document.getElementById('playWith') as HTMLDivElement;
const info = document.getElementById('info') as HTMLDivElement;
const rematchButton = document.getElementById('rematchButton') as HTMLButtonElement;
const leaveButton = document.getElementById('leaveButton') as HTMLButtonElement;

// Loading page
const loadingPage = document.getElementById('loadingPage') as HTMLDivElement;
const cancelButton = document.getElementById('cancelButton') as HTMLButtonElement;

// Customise page
const customisePage = document.getElementById('customisePage') as HTMLDivElement;
const playOnlineButton = document .getElementById('playOnlineButton') as HTMLButtonElement;
const playWithAIButton = document.getElementById('playWithAIButton') as HTMLButtonElement;
const playTournmentButton = document.getElementById('playTournmentButton') as HTMLButtonElement;
const createTournamentButton = document.getElementById('createTournamentButton') as HTMLButtonElement;

const hideAllPages = () => // DONE
{
	nickname_page.style.display = 'none';
	gamePage.style.display = 'none';
	loadingPage.style.display = 'none';
	customisePage.style.display = 'none';
};

const showPage = (page: HTMLElement) => // DONE
{
	hideAllPages();
	page.style.display = 'block';
};

function handleCellClick(event: Event) 
{
	const cell = event.target as HTMLElement;
	const index = Number(cell.dataset.index);
	if (board[index] || !gameActive) {
		cell.classList.add('hover:bg-red-100');
		return;
	}

	board[index] = youAre;
	cell.textContent = youAre;
	// tic.textContent = 'Tic-Tac-Toe';
	gameActive = false;
	if (checkWinner()) {
		gameActive = false;
		socket.send(JSON.stringify({ microservice: 'tictactoe', yourTurn: true, index: index, gameStatus: 'You lose'}));
		info.textContent = 'You win';
		player1_score.textContent = (++player1Score).toString();
		// showDiv(some_buttons_div);
		return;
	}

	if (board.every(cell => cell !== "")) {
		gameActive = false;
		socket.send(JSON.stringify({ microservice: 'tictactoe', yourTurn: true, index: index, gameStatus: 'It is draw'}));
		info.textContent = 'It is draw';
		// showDiv(some_buttons_div);
		return;
	}
	info.textContent = 'Opponent\'s turn';
	socket.send(JSON.stringify({ microservice: 'tictactoe', yourTurn: true, index: index }));
	
}

function checkWinner(): boolean 
{
	const winPatterns: number[][] = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];

	for (let pattern of winPatterns) {
		const [a, b, c] = pattern;
		if (board[a] && board[a] === board[b] && board[a] === board[c]) {
			return true;
		}
	}

	return false;
}

function ft_cancelLookingForGame()
{
	socket.send(JSON.stringify({ microservice: 'tictactoe', cancelLookingForGame: true }));
	showPage(customisePage);
}

function ft_lookingForGame()
{
	socket.send(JSON.stringify({ microservice: 'tictactoe', lookingForGame: true }));
	showPage(loadingPage);
}

function ft_leaveRoom()
{
	socket.send(JSON.stringify({ microservice: 'tictactoe', leftRoom: true }));
	board.fill("");
	cells.forEach(cell => cell.textContent = "");
	player1Score = 0;
	player2Score = 0;
	player1_score.textContent = '0';
	player2_score.textContent = '0';
	gameActive = true;
	showPage(customisePage);
}


cells.forEach(cell => {
	cell.addEventListener('mouseenter', (event) => {
		const target = event.target as HTMLElement;
        const index = Number(target.dataset.index);
		
        if (board[index]) {
			target.classList.add('hover:bg-red-100');
        }
    });
	
	cell.addEventListener('mouseleave', (event) => {
		const target = event.target as HTMLElement;
        target.classList.remove('hover:bg-red-100');
    });
	
	cell.addEventListener('click', handleCellClick);
});

nickname_button.addEventListener('click', () =>  //DONE
{
	if(nickname_input.value.trim() !== "")
	{
		socket.send(JSON.stringify({ microservice: 'tictactoe', registration: true, nickname: nickname_input.value }));
	}
});


playOnlineButton.addEventListener('click', () => ft_lookingForGame());
cancelButton.addEventListener('click', () => ft_cancelLookingForGame());
leaveButton.addEventListener('click', () => ft_leaveRoom());



showPage(nickname_page);

socket.onmessage = (event) =>
{
	const data = JSON.parse(event.data);
	if(data.microservice === 'tictactoe')
	{
		if(data.registration !== undefined)
		{
			if(data.registration === false)
			{
				alert('Nickname already exists');
				return;
			}
			player1_name.textContent = data.nickname;
			showPage(customisePage);
			return;
		}
		if(data.startGame)
		{
			player2_name.textContent = data.friendNickname;
			youAre = data.yourSymbol;
			opponent = youAre === 'X' ? 'O' : 'X';
			playWith.textContent = youAre;
			gameActive = youAre === 'X' ? true : false;
			info.textContent = youAre === 'X' ? 'Your turn' : 'Opponent\'s turn';
			showPage(gamePage);
			return;
		}
		if(data.yourTurn)
		{
			board[data.index] = opponent;
			cells[data.index].textContent = opponent;
			if(checkWinner())
			{
				gameActive = false;
				info.textContent = 'You lose';
				player2_score.textContent = (++player2Score).toString();
				return;
			}
			if(board.every(cell => cell !== ""))
			{
				gameActive = false;
				info.textContent = 'It is draw';
				return;
			}
			gameActive = true;
			info.textContent = 'Your turn';
			return;
		}
		if(data.leftRoom)
		{
			board.fill("");
			cells.forEach(cell => cell.textContent = "");
			player1Score = 0;
			player2Score = 0;
			player1_score.textContent = '0';
			player2_score.textContent = '0';
			gameActive = true;
			alert('Opponent left the room');
			showPage(customisePage);
			return;
		}
	}
}

};

