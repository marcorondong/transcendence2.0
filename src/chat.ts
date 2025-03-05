const socket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/ws`);

window.onload = () => 
{

	const chat = document.getElementById("chat") as HTMLDivElement;
	const messageInput = document.getElementById("message-input") as HTMLInputElement;
	const chatBox = document.getElementById("chat-box") as HTMLDivElement;
	const sendButton = document.getElementById("send-button") as HTMLButtonElement;
	const chatPerson = document.getElementById("chatPerson")!;
	const peopleOnlineList = document.getElementById("peopleOnlineList") as HTMLDivElement;
	const notificationList = document.getElementById("notificationList") as HTMLDivElement;
	const nickname_page = document.getElementById('nickname_page') as HTMLDivElement;
	const nickname_input = document.getElementById('nickname_input') as HTMLInputElement;
	const nickname_button = document.getElementById('nickname_button') as HTMLButtonElement;
	const me = document.getElementById('me')!;
	const peopleOnlineDiv = document.getElementById('peopleOnlineDiv') as HTMLDivElement;
	const notificationDiv = document.getElementById('notificationDiv') as HTMLDivElement;

	const chatBackButton = document.getElementById('chatBackButton') as HTMLButtonElement;
	const infoButton = document.getElementById('infoButton') as HTMLButtonElement;
	const inviteButton = document.getElementById('inviteButton') as HTMLButtonElement;
	const blockButton = document.getElementById('blockButton') as HTMLButtonElement;
	const notifBackButton = document.getElementById('notifBackButton') as HTMLButtonElement;
	const notifButton = document.getElementById('notifButton') as HTMLButtonElement;


	function appendMessage(message: string, isOwn: boolean): void // DONE
	{
		const newMessage = document.createElement("div");
		newMessage.classList.add("mb-2", "flex", isOwn ? "justify-end" : "justify-start", "items-start");
		newMessage.innerHTML = `<span class="${isOwn ? "bg-blue-500 text-white" : "bg-gray-200"} p-2 rounded-lg max-w-xs break-words">${message}</span>`;
		chatBox.appendChild(newMessage);
		chatBox.scrollTop = chatBox.scrollHeight;
	}

	// function appendNotification(notification: string): void // not fully implemented. Attention.
	// {
	// 	// const newNotificationContainer = document.createElement("div");
	// 	// newNotificationContainer.classList.add("flex", "items-center", "p-4", "hover:bg-gray-100", "cursor-pointer");


	// 	const newNotification = document.createElement("div");
	// 	newNotification.classList.add("mb-2", "flex", "justify-start", "items-start");
	// 	newNotification.innerHTML = `<span class="bg-yellow-500 text-white p-2 rounded-lg max-w-xs break-words">${notification}</span>`;
	// 	notificationList.appendChild(newNotification);
	// 	notificationList.scrollTop = chatBox.scrollHeight
	// }

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
			socket.send(JSON.stringify({ microservice: 'chat', chatHistoryRequest: true, chattingWith: text }));
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
				socket.send(JSON.stringify({ microservice: 'chat', message: messageInput.value, receiver: chatPerson.textContent }));
				appendMessage(messageInput.value, true);
				messageInput.value = '';
			}
		}
	}

	const hideAllPages = () => // reviewed
	{
		nickname_page.style.display = 'none';
		chat.style.display = 'none';
		peopleOnlineDiv.style.display = 'none';
		notificationDiv.style.display = 'none';
	};

	const showPage = (page: HTMLElement) => // reviewed
	{
		hideAllPages();
		page.style.display = 'block';
	};

	// ******** event listeners start here **************

	sendButton.addEventListener("click", sendMessage);

	notifButton.addEventListener('click', () => // reviewed
	{
		showPage(notificationDiv);
	});

	notifBackButton.addEventListener('click', () => // reviewed
	{
		showPage(peopleOnlineDiv);
	});

	chatBackButton.addEventListener('click', () => // reviewed
	{
		chatPerson.textContent = '';
		chatBox.innerHTML = '';
		showPage(peopleOnlineDiv);
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
		// appendNotification('You have invited ' + chatPerson.textContent + ' to play PingPong');
		socket.send(JSON.stringify({ microservice: 'chat', inviteThisPerson: chatPerson.textContent}));
	});

	blockButton.addEventListener('click', () =>  // reviewed
	{
		if(blockButton.style.backgroundColor === 'white')
			socket.send(JSON.stringify({ microservice: 'chat', blockThisPerson: chatPerson.textContent }));
		else if(blockButton.style.backgroundColor === 'green')
			socket.send(JSON.stringify({ microservice: 'chat', unblockThisPerson: chatPerson.textContent }));
		else
		{
			alert('Something went wrong. Expected blockButton color is green or white, but found ' + blockButton.style.backgroundColor);
			socket.send(JSON.stringify({ microservice: 'chat', error: 'Something went wrong. Expected blockButton color is green or white, but found ' + blockButton.style.backgroundColor }));
		}
	});

	nickname_button.addEventListener('click', () =>  // reviewed
	{
		if(nickname_input.value.trim() !== "")
		{
			socket.send(JSON.stringify({ microservice: 'chat', registerThisPerson: nickname_input.value }));
		}
		else
		{
			alert('Please enter a nickname');
		}
	});

	showPage(nickname_page);

	socket.onmessage = (event) => 
	{
		const data = JSON.parse(event.data);

		if(data.microservice)
		{
			if(data.microservice === 'chat')
			{
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
					if(data.block === true) // if person is blocked, blockButton color is updated accordingly
					{
						blockButton.style.backgroundColor = 'green';
					}
					else if(data.block === false)
					{
						blockButton.style.backgroundColor = 'white';
					}
					showPage(chat);
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
						showPage(peopleOnlineDiv);
					}
					deletePerson(data.nickname);
					return;
				}
				else if(data.registrationApproved && data.clientsOnline) // reviewed
				{
					me.textContent = data.registrationApproved;
					data.clientsOnline.forEach((client: { nickname: string }) => {
						appendPerson(client.nickname);
					});
					showPage(peopleOnlineDiv);
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
					// appendNotification(data.thisPersonInvitedYou + ' has invited you to play PingPong');
					return;
				}
				// else if(data.invitationAccepted) // not fully implemented. Attention.
				// {
				// 	alert(data.invitationAccepted + ' has accepted your invitation to play PingPong');
				// 	appendMessage(data.invitationAccepted + ' has accepted your invitation to play PingPong', true);
				// 	return;
				// }
				else
				{
					socket.send(JSON.stringify({ microservice: 'error', errorMessage: 'Error: "chat" microservice has no such request handler in client side sent by server to client under received "microservice": "chat" request in client side', sentData: data}));
					alert('Error: "chat" microservice has no such request handler in client side sent by server to client under received "microservice": "chat" request in client side');
					return;
				}
			}
			else if(data.microservice === 'error')
			{
				if(data.errorMessage)
				{
					alert(data.error);
				}
				else
				{
					socket.send(JSON.stringify({ microservice: 'error', errorMessage: 'Error: "errorMessage" property is not found in the data sent by server to client under received "microservice": "error" request in client side', sentData: data}));
					alert('Something went wrong. "errorMessage" property is not found in the data sent by server');
				}
				return;
			}
			else
			{
				socket.send(JSON.stringify({ microservice: 'error', errorMessage: `Error: server sent client data with unknown microservice: ${data.microservice}`, sentData: data }));
				alert(`Something went wrong. server sent client data with undefined microservice: ${data.microservice}`);
			}
		}
		else
		{
			socket.send(JSON.stringify({ microservice: 'error', errorMessage: 'Error: "microservice" property is not found or has falsy value in the data sent by server to client', sentData: data }));
			alert('Something went wrong. "microservice" property is not found in the data sent by server');
		}
	}
};