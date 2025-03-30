const socket = new WebSocket(`wss://${window.location.hostname}:${window.location.port}/ws`);
const tic_socket = new WebSocket(`wss://${window.location.hostname}:3001/ws`);
const chat_socket = new WebSocket(`wss://${window.location.hostname}:3002/ws`);

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

	// const changeToChatButton = document.getElementById('changeToChatButton') as HTMLButtonElement;
	// const changeToGameButton = document.getElementById('changeToGameButton') as HTMLButtonElement;
	
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
	const loadingPage_tic = document.getElementById('loadingPage_tic') as HTMLDivElement;
	const cancelButton = document.getElementById('cancelButton') as HTMLButtonElement;
	
	// Customise page
	const customisePage = document.getElementById('customisePage') as HTMLDivElement;
	const playOnlineButton = document .getElementById('playOnlineButton') as HTMLButtonElement;
	const playWithAIButton = document.getElementById('playWithAIButton') as HTMLButtonElement;
	const playTournamentButton = document.getElementById('playTournamentButton') as HTMLButtonElement;
	const createNewTournamentButton = document.getElementById('createNewTournamentButton') as HTMLButtonElement;

	const notificationMap = new Map<string, HTMLDivElement>();

	const chat = document.getElementById("chat") as HTMLDivElement;
	const messageInput = document.getElementById("message-input") as HTMLInputElement;
	const chatBox = document.getElementById("chat-box") as HTMLDivElement;
	const sendButton = document.getElementById("send-button") as HTMLButtonElement;
	const chatPerson = document.getElementById("chatPerson")!;
	const peopleOnlineList = document.getElementById("peopleOnlineList") as HTMLDivElement;
	const notificationList = document.getElementById("notificationList") as HTMLDivElement;
	// const nickname_page = document.getElementById('nickname_page') as HTMLDivElement;
	// const nickname_input = document.getElementById('nickname_input') as HTMLInputElement;
	// const nickname_button = document.getElementById('nickname_button') as HTMLButtonElement;
	// const me = document.getElementById('me')!;
	const peopleOnlineDiv = document.getElementById('peopleOnlineDiv') as HTMLDivElement;
	const notificationDiv = document.getElementById('notificationDiv') as HTMLDivElement;

	const chatBackButton = document.getElementById('chatBackButton') as HTMLButtonElement;
	const infoButton = document.getElementById('infoButton') as HTMLButtonElement;
	const inviteButton = document.getElementById('inviteButton') as HTMLButtonElement;
	const blockButton = document.getElementById('blockButton') as HTMLButtonElement;
	const notifBackButton = document.getElementById('notifBackButton') as HTMLButtonElement;
	const notifButton = document.getElementById('notifButton') as HTMLButtonElement;
	const loadingPage_chat = document.getElementById('loadingPage_chat') as HTMLDivElement;
	const cancelLoadingButton = document.getElementById('cancelLoadingButton') as HTMLButtonElement;


	// PONGG
	const pongPage = document.getElementById('pongPage') as HTMLDivElement;
	const playPongButton = document.getElementById('playPongButton') as HTMLButtonElement;
	const backPongButton = document.getElementById('backPongButton') as HTMLButtonElement;

	function appendMessage(message: string, isOwn: boolean): void // DONE
	{
		const newMessage = document.createElement("div");
		newMessage.classList.add("mb-2", "flex", isOwn ? "justify-end" : "justify-start", "items-start");
		newMessage.innerHTML = `<span class="${isOwn ? "bg-blue-500 text-white" : "bg-gray-200"} p-2 rounded-lg max-w-xs break-words">${message}</span>`;
		chatBox.appendChild(newMessage);
		chatBox.scrollTop = chatBox.scrollHeight;
	}

	function appendNotification(person: string, text: string, invitation: boolean): void // not fully implemented. Attention.
	{
		const NotificationContainer = document.createElement("div");
		NotificationContainer.classList.add("items-center", "p-4", "hover:bg-gray-100", "cursor-pointer");

		const newNotification = document.createElement("div");
		newNotification.classList.add("text-lg", "font-semibold", "text-gray-900", "flex-grow", "break-words");
		newNotification.textContent = person + text;

		NotificationContainer.appendChild(newNotification);
		if(invitation)
		{
			const buttonContainer = document.createElement("div");
			buttonContainer.classList.add("flex", "items-center");

			const acceptButton = document.createElement("button");
			acceptButton.classList.add("px-4", "py-2", "bg-green-500", "text-white", "rounded-lg", "hover:bg-green-600", "focus:outline-none");
			acceptButton.textContent = "Accept";
			acceptButton.addEventListener("click", () => {
				// not fully implemented. Attention.
				// should be integrated with pingpong
				chat_socket.send(JSON.stringify({ startGame: person }));
				appendNotification(person, ' \'s invitation accepted', false);
				buttonContainer.remove();
			});


			const rejectButton = document.createElement("button");
			rejectButton.classList.add("px-4", "py-2", "bg-red-500", "text-white", "rounded-lg", "hover:bg-red-600", "focus:outline-none", "ml-2");
			rejectButton.textContent = "Reject";
			rejectButton.addEventListener("click", () => {
				// not fully implemented. Attention.
				// should be integrated with pingpong
				chat_socket.send(JSON.stringify({ notification: ' rejected your invitation', receiver: person }));
				appendNotification(person, ' \'s invitation rejected', false);
				buttonContainer.remove();
			});

			buttonContainer.appendChild(acceptButton);
			buttonContainer.appendChild(rejectButton);
			NotificationContainer.appendChild(buttonContainer);
			notificationMap.set(person, buttonContainer);
		}


		notificationList.appendChild(NotificationContainer);
		notificationList.scrollTop = notificationList.scrollHeight;
	}

	function appendPerson(text: string): void {
		const personContainer = document.createElement("div");
		personContainer.classList.add("flex", "items-center", "p-4", "hover:bg-gray-100", "cursor-pointer");
		personContainer.setAttribute("data-person", text);

		const personName = document.createElement("div");
		personName.classList.add("text-lg", "font-semibold", "text-gray-900", "flex-grow", "truncate");
		personName.textContent = text;

		const newMessageIndicator = document.createElement("div");
		newMessageIndicator.classList.add("new-message-indicator", "w-3", "h-3", "rounded-full", "ml-4");

		personContainer.appendChild(personName);
		personContainer.appendChild(newMessageIndicator);

		personContainer.addEventListener("click", () => {
			chatPerson.textContent = text;
			chat_socket.send(JSON.stringify({ chatHistoryRequest: text}));
			newMessageIndicator.classList.add("hidden"); // Hide the indicator when the person is clicked
		});

		peopleOnlineList.appendChild(personContainer);
		peopleOnlineList.scrollTop = peopleOnlineList.scrollHeight;
	}

	function deletePerson(text: string): void 
	{
		const personElement = peopleOnlineList.querySelector(`[data-person="${text}"]`);
		if (personElement) {
			peopleOnlineList.removeChild(personElement);
		} else {
			alert('Warning: Person not found');
		}
	}

	function deleteButtonContainer(text: string): void // not fully implemented. Attention.
	{
		const buttonContainer = notificationMap.get(text);
		if(buttonContainer)
		{
			buttonContainer.remove();
			notificationMap.delete(text);
		}
		else
		{
			alert('Warning: Button container not found');
		}
	}

	function updateNewMessageIndicator(person: string, hasNewMessage: boolean): void {
		const personElement = peopleOnlineList.querySelector(`[data-person="${person}"]`);
		if (personElement) {
			const newMessageIndicator = personElement.querySelector('.new-message-indicator');
			if (newMessageIndicator) {
				if (hasNewMessage) {
					newMessageIndicator.classList.remove('hidden');
					newMessageIndicator.classList.add('bg-green-500');
				} else {
					newMessageIndicator.classList.add('hidden');
					newMessageIndicator.classList.remove('bg-green-500');
				}
			}
		}
	}

	function sendMessage(): void // reviewed
	{
		if(chatPerson.textContent)
		{
			if(messageInput.value.trim() !== "")
			{
				if(blockButton.style.backgroundColor === 'green')
				{
					alert('You have blocked this person. Unblock to send message');
					return;
				}
				chat_socket.send(JSON.stringify({ message: messageInput.value, receiver: chatPerson.textContent }));
				appendMessage(messageInput.value, true);
				messageInput.value = '';
			}
		}
	}

	// const hidethese = (element: HTMLElement) => // reviewed
	// {
	// 	notificationDiv.style.display = 'none';
	// 	chat.style.display = 'none';
	// }

	const hideAllPages = () => // reviewed
	{
		nickname_page.style.display = 'none';
		chat.style.display = 'none';
		peopleOnlineDiv.style.display = 'none';
		notificationDiv.style.display = 'none';
		loadingPage_chat.style.display = 'none';
		gamePage.style.display = 'none';
		nickname_page.style.display = 'none';
		loadingPage_tic.style.display = 'none';
		customisePage.style.display = 'none';
		rematchRequestReceiver.style.display = 'none';
		rematchRequestSender.style.display = 'none';
		pongPage.style.display = 'none';
		backPongButton.style.display = 'none';
	};

	const hideAllPagesChat = () =>
	{
		peopleOnlineDiv.style.display = 'none';
		notificationDiv.style.display = 'none';
		chat.style.display = 'none';
	}

	const showPage = (page: HTMLElement) => // reviewed
	{
		hideAllPages();
		page.style.display = 'block';
	};

	const showPageChat = (page: HTMLElement) => // reviewed
	{
		hideAllPagesChat();
		page.style.display = 'block';
	};

	// ******** event listeners start here **************

	// PONGG
	playPongButton.addEventListener('click', () =>
	{
		 showPage(pongPage);
		 backPongButton.style.display = 'block';
	});

	backPongButton.addEventListener('click', () => showPage(customisePage));

	sendButton.addEventListener("click", sendMessage);

	cancelLoadingButton.addEventListener('click', () => // reviewed
	{
		chat_socket.send(JSON.stringify({ invitationCanceled: chatPerson.textContent }));
		appendNotification('', 'you have canceled the invitation', false);
		hideAllPages();
		showPage(gamePage);
		showPageChat(peopleOnlineDiv);
	});

	notifButton.addEventListener('click', () => // reviewed
	{
		showPageChat(notificationDiv);
	});

	notifBackButton.addEventListener('click', () => // reviewed
	{
		showPageChat(peopleOnlineDiv);
	});

	chatBackButton.addEventListener('click', () => // reviewed
	{
		chatPerson.textContent = '';
		chatBox.innerHTML = '';
		showPageChat(peopleOnlineDiv);
	});

	infoButton.addEventListener('click', () => // not fully implemented. Attention.
	{
		if(blockButton.style.backgroundColor === 'green')
		{
			alert('You have blocked this person. Unblock to view info');
			return;
		}
		alert('This is ' + chatPerson.textContent + '. He is hopefully a good guy');
	});

	inviteButton.addEventListener('click', () => // not fully implemented. Attention.
	{
		if(blockButton.style.backgroundColor === 'green')
		{
			alert('You have blocked this person. Unblock to invite');
			return;
		}
		// not fully implemented. Attention.
		//
		//
		// should be integrated with pingpong
		appendNotification(chatPerson.textContent ?? '', ' has been invited to play PingPong', false);
		chat_socket.send(JSON.stringify({ inviteThisPerson: chatPerson.textContent}));
		showPageChat(loadingPage_chat);
	});

	blockButton.addEventListener('click', () =>  // reviewed
	{
		if(blockButton.style.backgroundColor === 'white')
			chat_socket.send(JSON.stringify({ blockThisPerson: chatPerson.textContent }));
		else if(blockButton.style.backgroundColor === 'green')
			chat_socket.send(JSON.stringify({ unblockThisPerson: chatPerson.textContent }));
	});

	// showPage(nickname_page);




	
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
		showPageChat(peopleOnlineDiv);
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
				tic_socket.send(JSON.stringify({ yourTurn: true, index: index, gameStatus: 'You lose'}));
			info.textContent = 'You win';
			alert('You win');
			player1_score.textContent = (++player1Score).toString();
			return;
		}
		
		if (board.every(cell => cell !== "")) {
			gameActive = false;
			if(!aiFlag)
				tic_socket.send(JSON.stringify({ yourTurn: true, index: index, gameStatus: 'It is draw'}));
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
		tic_socket.send(JSON.stringify({ yourTurn: true, index: index }));
		
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
		tic_socket.send(JSON.stringify({ cancelLookingForGame: true }));
		showPage(customisePage);
	}
	
	function ft_lookingForGame()
	{
		aiFlag = false;
		tic_socket.send(JSON.stringify({ lookingForGame: true }));
		showPage(loadingPage_tic);
	}
	
	function ft_leaveRoom()
	{
		tic_socket.send(JSON.stringify({ leftRoom: true }));
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
		tic_socket.send(JSON.stringify({ rematchRequest: true }));
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
		tic_socket.send(JSON.stringify({ rematchRequestAccepted: true , yourSymbol: youAre === 'X' ? 'O' : 'X' }));
		gameActive = youAre === 'X' ? true : false;
		showPage(gamePage);
		showPageChat(peopleOnlineDiv);
	}
	
	function ft_cancelRematchRequest()
	{
		rematchRequestSender.style.display = 'none';
		rematchRequestReceiver.style.display = 'none';
		tic_socket.send(JSON.stringify({ rematchRequestCanceled: true }));
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
			socket.send(JSON.stringify({ microservice: 'frontend', registerThisPerson: nickname_input.value }));
			// tic_socket.send(JSON.stringify({ registerThisPerson: nickname_input.value }));
			// chat_socket.send(JSON.stringify({ registerThisPerson: nickname_input.value }));
		}
		else
		{
			alert('Enter your nickname');
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

	// changeToChatButton.addEventListener('click', () => showPage(peopleOnlineDiv));
	// changeToGameButton.addEventListener('click', () => showPage(gamePage));

	
	showPage(nickname_page);

	socket.onmessage = (event) =>
	{
		const data = JSON.parse(event.data);
		if(data.microservice === 'frontend')
		{
			if(data.registrationApproved)
			{
				tic_socket.send(JSON.stringify({ registerThisPerson: data.registrationApproved }));
				chat_socket.send(JSON.stringify({ registerThisPerson: data.registrationApproved }));
				me.textContent = data.registrationApproved;
				showPage(customisePage);
			}
			else if(data.registrationDeclined)
			{
				alert(data.registrationDeclined);
			}
		}
	}
	
	tic_socket.onmessage = (event) =>
	{
		const data = JSON.parse(event.data);
			if(data.registrationApproved)
			{
				player1_name.textContent = data.registrationApproved;
				// showPage(customisePage);
			}
			else if(data.registrationDeclined)
			{
				alert(data.registrationDeclined);
			}
			else if(data.startGame)
			{
				player2_name.textContent = data.friendNickname;
				youAre = data.yourSymbol;
				opponent = youAre === 'X' ? 'O' : 'X';
				playWith.textContent = youAre;
				gameActive = youAre === 'X' ? true : false;
				info.textContent = youAre === 'X' ? 'Your turn' : 'Opponent\'s turn';
				showPage(gamePage);
				showPageChat(peopleOnlineDiv);
			}
			else if(data.yourTurn)
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
			}
			else if(data.leftRoom)
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
			}
			else if(data.rematchRequest)
			{
				rematchRequestSender.style.display = 'none';
				rematchRequestReceiver.style.display = 'block';
			}
			else if(data.rematchRequestAccepted)
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
				showPageChat(peopleOnlineDiv);
			}
			else if(data.rematchRequestCanceled)
			{
				rematchRequestSender.style.display = 'none';
				rematchRequestReceiver.style.display = 'none';
			}
			else
			{
				alert('Error: "tictactoe" microservice has no such request handler in client side sent by server to client under received "microservice": "tictactoe" request in client side');
				return;
			}
	}

	chat_socket.onmessage = (event) => 
		{
			const data = JSON.parse(event.data);

			if(data.message)
			{
				if(data.sender === chatPerson.textContent)
					appendMessage(data.message, false);
				else
					updateNewMessageIndicator(data.sender, true);
				return;
			}
			else if(data.chatHistoryProvided) // reviewed
			{
				chatBox.innerHTML = '';
				// console.log('Chat history:', data.chatHistory);
				data.chatHistoryProvided.forEach((message: { text: string; isOwn: boolean; }) => {
					appendMessage(message.text, message.isOwn);
				});
				console.log('aaaaaaaaaaaa' + data.block);
				if(data.block === true) // if person is blocked, blockButton color is updated accordingly
				{
					blockButton.style.backgroundColor = 'green';
				}
				else if(data.block === false)
				{
					blockButton.style.backgroundColor = 'white';
				}
				showPageChat(chat);
				return;
			}
			else if(data.newClientOnline)
			{
				appendPerson(data.newClientOnline);
				return;
			}
			else if(data.clientDisconnected)
			{
				if(data.nickname === chatPerson.textContent)
				{
					alert(data.nickname + ' has disconnected');
					showPageChat(peopleOnlineDiv);
				}
				deletePerson(data.nickname);
				return;
			}
			else if(data.registrationApproved && data.clientsOnline) // reviewed
			{
				// me.textContent = data.registrationApproved;
				data.clientsOnline.forEach((client: { nickname: string }) => {
					appendPerson(client.nickname);
				});
				// showPage(peopleOnlineDiv);
				return;
			}
			else if(data.registrationDeclined) // reviewed
			{
				alert(data.registrationDeclined);
				return;
			}
			else if(data.thisPersonBlocked) // reviewed
			{
				alert('You have blocked ' + data.thisPersonBlocked);
				if(data.thisPersonBlocked === chatPerson.textContent)
				{
					blockButton.style.backgroundColor = 'green';
				}
				return;
			}
			else if(data.thisPersonUnblocked) // reviewed
			{
				alert('You have unblocked ' + data.thisPersonUnblocked);
				if(data.thisPersonUnblocked === chatPerson.textContent)
				{
					blockButton.style.backgroundColor = 'white';
				}
				return;
			}
			else if(data.thisPersonInvitedYou) // not fully implemented. Attention.
			{
				appendNotification(data.thisPersonInvitedYou, ' has invited you to play PingPong', true);
				return;
			}
			else if(data.invitationCanceled) // not fully implemented. Attention.
			{
				alert(data.invitationCanceled + ' has canceled the invitation');
				appendNotification(data.invitationCanceled, ' has canceled the invitation', false);
				deleteButtonContainer(data.invitationCanceled);
				showPageChat(peopleOnlineDiv);
				return;
			}
			else if(data.notification)
			{
				appendNotification(data.sender, data.notification, false);
				return;
			}
			else if(data.startGame)
			{
				showPage(pongPage);
				backPongButton.style.display = 'block';
				startGame();
			}
			else
			{
				alert('Error: "chat" microservice has no such request handler in client side sent by server to client under received "microservice": "chat" request in client side');
				return;
			}
		}




		//pingpong
		let wss: WebSocket | null = null;
		let leftPaddleDirection: number = 0;
	
		interface Paddle {
			x: number;
			y: number;
			height: number;
		}
	
		interface Ball {
			x: number;
			y: number;
			radius: number;
		}
	
		interface Score {
			leftGoals: number;
			rightGoals: number;
			time: number | false;
		}
	
		interface GameState {
			leftPaddle: Paddle;
			rightPaddle: Paddle;
			ball: Ball;
			score: Score;
			roomId: string;
			knockoutName?: string;
			matchStatus?: string;
		}
	
		let gameState: GameState = {
			leftPaddle: { x: -4, y: 0, height: 1 },
			rightPaddle: { x: 4, y: 0, height: 1 },
			ball: { x: 0, y: 0, radius: 0.25 },
			score: { leftGoals: 0, rightGoals: 0, time: false },
			roomId: "N/A",
		};
	
		const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
		const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
	
		function startGame(): void {
			const queryParams = window.location.search;
			wss = new WebSocket(`wss://${window.location.hostname}:3010/pong/${queryParams}`);
	
			wss.onopen = () => {
				console.log("WebSocket Connection Established");
			};
	
			wss.onmessage = (event: MessageEvent) => {
				gameState = JSON.parse(event.data);
				updateGameUI();
				drawGame();
			};
	
			setInterval(() => {
				if (wss && wss.readyState === WebSocket.OPEN && leftPaddleDirection !== 0) {
					wss.send(JSON.stringify({ move: leftPaddleDirection > 0 ? "down" : "up", paddle: "left" }));
				}
			}, 1000 / 60);
		}
	
		function updateGameUI(): void {
			(document.getElementById("roomId") as HTMLElement).innerText = gameState.roomId || "N/A";
			(document.getElementById("knockoutName") as HTMLElement).innerText = gameState.knockoutName || "N/A";
			(document.getElementById("matchStatus") as HTMLElement).innerText = gameState.matchStatus || "N/A";
		}
	
		function drawGame(): void {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			let scaleX = canvas.width / 9;
			let scaleY = canvas.height / 5;
	
			drawFieldBorders(scaleX, scaleY);
			drawPaddle(gameState.leftPaddle.x * scaleX, gameState.leftPaddle.y * scaleY, gameState.leftPaddle.height * scaleY);
			drawPaddle(gameState.rightPaddle.x * scaleX, gameState.rightPaddle.y * scaleY, gameState.rightPaddle.height * scaleY);
			drawBall(gameState.ball.x * scaleX, gameState.ball.y * scaleY, gameState.ball.radius * scaleX);
			drawScore();
		}
	
		function drawFieldBorders(scaleX: number, scaleY: number): void {
			ctx.strokeStyle = "white";
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(-4.5 * scaleX + canvas.width / 2, -2.5 * scaleY + canvas.height / 2);
			ctx.lineTo(-4.5 * scaleX + canvas.width / 2, 2.5 * scaleY + canvas.height / 2);
			ctx.moveTo(4.5 * scaleX + canvas.width / 2, -2.5 * scaleY + canvas.height / 2);
			ctx.lineTo(4.5 * scaleX + canvas.width / 2, 2.5 * scaleY + canvas.height / 2);
			ctx.stroke();
		}
	
		function drawPaddle(x: number, y: number, height: number): void {
			ctx.fillStyle = "white";
			ctx.fillRect(x + canvas.width / 2 - 5, -y + canvas.height / 2 - height / 2, 10, height);
		}
	
		function drawBall(x: number, y: number, radius: number): void {
			ctx.fillStyle = "white";
			ctx.beginPath();
			ctx.arc(x + canvas.width / 2, -y + canvas.height / 2, radius, 0, Math.PI * 2);
			ctx.fill();
		}
	
		function drawScore(): void {
			ctx.fillStyle = "white";
			ctx.font = "24px Arial";
			ctx.fillText(`Left: ${gameState.score.leftGoals}`, canvas.width / 4, 30);
			ctx.fillText(`Right: ${gameState.score.rightGoals}`, (canvas.width * 3) / 4, 30);
			if (gameState.score.time !== false) {
				ctx.fillText(`Time: ${gameState.score.time}s`, canvas.width / 2 - 40, 30);
			}
		}
	
		document.addEventListener("keydown", (event: KeyboardEvent) => {
			if (event.key === "ArrowUp") leftPaddleDirection = -1;
			if (event.key === "ArrowDown") leftPaddleDirection = 1;
		});
	
		document.addEventListener("keyup", (event: KeyboardEvent) => {
			if (event.key === "ArrowUp" || event.key === "ArrowDown") leftPaddleDirection = 0;
		});
	
		function copyRoomId(): void {
			const roomId = (document.getElementById("roomId") as HTMLElement).innerText;
			navigator.clipboard.writeText(roomId).then(() => {
				alert("Room ID copied to clipboard!");
			}).catch((err) => {
				console.error("Failed to copy Room ID", err);
			});
		}
	
		function stopGame(): void {
			if (wss && wss.readyState === WebSocket.OPEN) {
				wss.close(1000, "Closing connection");
				console.log("WebSocket Closed");
			} else {
				console.log("WebSocket is already closed or not open.");
			}
		}
	
		(document.getElementById("playPongButton") as HTMLElement).addEventListener("click", startGame);
		(document.getElementById("backPongButton") as HTMLElement)?.addEventListener("click", stopGame);
		(document.getElementById("copyRoomButton") as HTMLElement).addEventListener("click", copyRoomId);
};