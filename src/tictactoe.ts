const socket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/ws`);

window.onload = () =>
{

const board = ["", "", "", "", "", "", "", "", ""];
let gameActive = true;
let player1Score = 0;
let player2Score = 0;
let youAre = 'X';
let opponent = 'O';
let aiFlag: Boolean = false;
let aiIndexOptions: number [] = [0, 1, 2, 3, 4, 5, 6, 7, 8];
let aiIndex: number = 0;

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
const acceptRematchButton = document.getElementById('acceptRematchButton') as HTMLButtonElement;
const declineRematchButton = document.getElementById('declineRematchButton') as HTMLButtonElement;
const cancelRematchButton = document.getElementById('cancelRematchButton') as HTMLButtonElement;
const rematchRequestSender = document.getElementById('rematchRequestSender') as HTMLDivElement;
const rematchRequestReceiver = document.getElementById('rematchRequestReceiver') as HTMLDivElement;
// Loading page
const loadingPage = document.getElementById('loadingPage') as HTMLDivElement;
const cancelButton = document.getElementById('cancelButton') as HTMLButtonElement;

// Customise page
const customisePage = document.getElementById('customisePage') as HTMLDivElement;
const playOnlineButton = document .getElementById('playOnlineButton') as HTMLButtonElement;
const playWithAIButton = document.getElementById('playWithAIButton') as HTMLButtonElement;
const playTournamentButton = document.getElementById('playTournamentButton') as HTMLButtonElement;
const createNewTournamentButton = document.getElementById('createNewTournamentButton') as HTMLButtonElement;

const hideAllPages = () => // DONE
{
	nickname_page.style.display = 'none';
	gamePage.style.display = 'none';
	loadingPage.style.display = 'none';
	customisePage.style.display = 'none';
	rematchRequestReceiver.style.display = 'none';
	rematchRequestSender.style.display = 'none';
};

const showPage = (page: HTMLElement) => // DONE
{
	hideAllPages();
	page.style.display = 'block';
};

function ft_aiMove()
{
	let index_ai_options: number [] = [0, 1, 2, 3, 4, 5, 6, 7, 8];
	let index_ai: number = index_ai_options[Math.floor(Math.random() * index_ai_options.length)];
	while(board[index_ai] !== "")
	{
		index_ai_options.filter(item => item !== index_ai);
		index_ai = index_ai_options[Math.floor(Math.random() * index_ai_options.length)];
	}
	board[index_ai] = opponent;
	cells[index_ai].textContent = opponent;
	if(checkWinner())
	{
		gameActive = false;
		info.textContent = 'You lose';
		alert('You lose');
		player2_score.textContent = (++player2Score).toString();
		return;
	}
	if(board.every(cell => cell !== ""))
	{
		gameActive = false;
		info.textContent = 'It is draw';
		alert('It is draw');
		return;
	}
	info.textContent = 'Your turn';
}

function ft_playWithAI()
{
	aiFlag = true;
	board.fill("");
	cells.forEach(cell => cell.textContent = "");
	player1Score = 0;
	player2Score = 0;
	player1_score.textContent = '0';
	player2_score.textContent = '0';
	player2_name.textContent = 'AI';
	youAre = Math.random() < 0.5 ? 'X' : 'O';
	opponent = youAre === 'X' ? 'O' : 'X';
	playWith.textContent = youAre;
	// gameActive = youAre === 'X' ? true : false;
	showPage(gamePage);
	if(youAre === 'O')
	{
		ft_aiMove();
	}
}

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
	if (checkWinner()) {
		gameActive = false;
		if(!aiFlag)
			socket.send(JSON.stringify({ microservice: 'tictactoe', yourTurn: true, index: index, gameStatus: 'You lose'}));
		info.textContent = 'You win';
		alert('You win');
		player1_score.textContent = (++player1Score).toString();
		return;
	}
	
	if (board.every(cell => cell !== "")) {
		gameActive = false;
		if(!aiFlag)
			socket.send(JSON.stringify({ microservice: 'tictactoe', yourTurn: true, index: index, gameStatus: 'It is draw'}));
		info.textContent = 'It is draw';
		alert('It is draw');
		return;
	}
	info.textContent = 'Opponent\'s turn';
	if(aiFlag)
	{
		ft_aiMove();
		return;
	}
	gameActive = false;
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
	aiFlag = false;
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

function ft_rematchRequest()
{
	if(aiFlag)
	{
		board.fill("");
		cells.forEach(cell => cell.textContent = "");
		youAre = youAre === 'X' ? 'O' : 'X';
		opponent = youAre === 'X' ? 'O' : 'X';
		playWith.textContent = youAre;
		gameActive = true;
		// gameActive = youAre === 'X' ? true : false;
		info.textContent = youAre === 'X' ? 'Your turn' : 'Opponent\'s turn';
		if(youAre === 'O')
		{
			ft_aiMove();
		}
		return
	}
	rematchRequestSender.style.display = 'block';
	rematchRequestReceiver.style.display = 'none';
	socket.send(JSON.stringify({ microservice: 'tictactoe', rematchRequest: true }));
}

function ft_rematchRequestAccepted()
{
	board.fill("");
	cells.forEach(cell => cell.textContent = "");
	gameActive = true;
	youAre = youAre === 'X' ? 'O' : 'X';
	opponent = youAre === 'X' ? 'O' : 'X';
	playWith.textContent = youAre;
	info.textContent = youAre === 'X' ? 'Your turn' : 'Opponent\'s turn';
	rematchRequestSender.style.display = 'none';
	rematchRequestReceiver.style.display = 'none';
	socket.send(JSON.stringify({ microservice: 'tictactoe', rematchRequestAccepted: true , yourSymbol: youAre === 'X' ? 'O' : 'X' }));
	gameActive = youAre === 'X' ? true : false;
	showPage(gamePage);
}

function ft_cancelRematchRequest()
{
	rematchRequestSender.style.display = 'none';
	rematchRequestReceiver.style.display = 'none';
	socket.send(JSON.stringify({ microservice: 'tictactoe', rematchRequestCanceled: true }));
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
rematchButton.addEventListener('click', () => ft_rematchRequest());
acceptRematchButton.addEventListener('click', () => ft_rematchRequestAccepted());
cancelRematchButton.addEventListener('click', () => ft_cancelRematchRequest());
declineRematchButton.addEventListener('click', () => ft_cancelRematchRequest());
playWithAIButton.addEventListener('click', () => ft_playWithAI());
playTournamentButton.addEventListener('click', () => alert('Not implemented yet'));
createNewTournamentButton.addEventListener('click', () => alert('Not implemented yet'));

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
				alert('You lose');
				player2_score.textContent = (++player2Score).toString();
				return;
			}
			if(board.every(cell => cell !== ""))
			{
				gameActive = false;
				info.textContent = 'It is draw';
				alert('It is draw');
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
		if(data.rematchRequest)
		{
			rematchRequestSender.style.display = 'none';
			rematchRequestReceiver.style.display = 'block';
			return;
		}
		if(data.rematchRequestAccepted)
		{
			board.fill("");
			cells.forEach(cell => cell.textContent = "");
			gameActive = true;
			youAre = data.yourSymbol;
			opponent = youAre === 'X' ? 'O' : 'X';
			playWith.textContent = youAre;
			info.textContent = youAre === 'X' ? 'Your turn' : 'Opponent\'s turn';
			rematchRequestSender.style.display = 'none';
			rematchRequestReceiver.style.display = 'none';
			gameActive = youAre === 'X' ? true : false;
			showPage(gamePage);
			return;
		}
		if(data.rematchRequestCanceled)
		{
			rematchRequestSender.style.display = 'none';
			rematchRequestReceiver.style.display = 'none';
			return;
		}
	}
}

};

