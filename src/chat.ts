const socket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/ws`);

// const blockedList: string[] = [];
let currentMagenta = document.createElement('button');

const chat = document.getElementById("chat") as HTMLDivElement;
const messageInput = document.getElementById("message-input") as HTMLInputElement;
const chatBox = document.getElementById("chat-box") as HTMLDivElement;
const sendButton = document.getElementById("send-button") as HTMLButtonElement;
const chatPerson = document.getElementById("chatPerson")!;
const peopleOnlineList = document.getElementById("peopleOnlineList") as HTMLDivElement;
const friendRequestButton = document.getElementById('friendRequestButton') as HTMLButtonElement;
const friendRequestInput = document.getElementById('friendRequestInput') as HTMLInputElement;
const nickname_page = document.getElementById('nickname_page') as HTMLDivElement;
const nickname_input = document.getElementById('nickname_input') as HTMLInputElement;
const nickname_button = document.getElementById('nickname_button') as HTMLButtonElement;
const game = document.getElementById('game') as HTMLDivElement;
const tic = document.getElementById('tic')!;

// function displayMessages(person: string): void 
// {
// 	chatBox.innerHTML = '';
// 	const messages = messageHistories[person] || [];
// 	messages.forEach(message => {
// 		const messageElement = document.createElement("div");
// 		messageElement.classList.add("mb-2", "flex", message.isOwnMessage ? "justify-end" : "justify-start", "items-start");
// 		messageElement.innerHTML = `<span class="${message.isOwnMessage ? "bg-blue-500 text-white" : "bg-gray-200"} p-2 rounded-lg">${message.text}</span>`;
// 		chatBox.appendChild(messageElement);
// 	});
// 	chatBox.scrollTop = chatBox.scrollHeight;
// }

function appendMessage(message: string, isOwnMessage: boolean): void // DONE
{
	const newMessage = document.createElement("div");
	newMessage.classList.add("mb-2", "flex", isOwnMessage ? "justify-end" : "justify-start", "items-start");
	newMessage.innerHTML = `<span class="${isOwnMessage ? "bg-blue-500 text-white" : "bg-gray-200"} p-2 rounded-lg">${message}</span>`;
	chatBox.appendChild(newMessage);
	chatBox.scrollTop = chatBox.scrollHeight;
}

// function changePersonBackgroundColor(): void 
// {
//     const buttons = peopleOnlineList.querySelectorAll('button');
//     buttons.forEach(button => {
//         const buttonElement = button as HTMLElement;
//         if (buttonElement.style.backgroundColor === 'magenta') {
//             buttonElement.style.backgroundColor = 'blue';
//         }
//     });
// }

function appendPerson(text: string): void 
{
	const personContainer = document.createElement("div");
	personContainer.classList.add("mb-2", "flex", "justify-between", "items-center");
	personContainer.setAttribute("data-person", text);

	const person = document.createElement("button");
	person.classList.add("bg-blue-500", "text-white", "p-2", "rounded-lg");
	person.textContent = text;
	person.addEventListener("click", () => {
		chatPerson.textContent = text;
		currentMagenta.style.backgroundColor = 'blue';
		currentMagenta = person;
		person.style.backgroundColor = 'magenta';
		socket.send(JSON.stringify({ microservice: 'chat', chatHistoryRequest: true, nickname: tic.textContent, chatingWith: text }));
	});

	const buttonContainer = document.createElement("div");
	buttonContainer.classList.add("flex", "space-x-2");

	const button1 = document.createElement("button");
	button1.classList.add("bg-green-500", "text-white", "px-2", "py-1", "rounded");
	button1.textContent = "Info";
	button1.addEventListener("click", () => {
		alert('Info button clicked');
		// chatPerson.textContent = text;
	});

	const button2 = document.createElement("button");
	button2.classList.add("bg-yellow-500", "text-white", "px-2", "py-1", "rounded");
	button2.textContent = "Invite";
	button2.addEventListener("click", () => {
		// showPage(loading);
		// socket.send(JSON.stringify({ matchRequest: true, requestedPerson: text, nickname: player1_name.textContent }));
		alert('Button 2 clicked');
	});

	const button3 = document.createElement("button");
	button3.classList.add("bg-red-500", "text-white", "px-2", "py-1", "rounded");
	button3.textContent = "Block";
	button3.addEventListener("click", () => {
		// blockedList.push(text);
		alert('Blocked');
		button3.textContent = "Blocked";
		// deletePerson(text);
	});


	buttonContainer.appendChild(button1);
	buttonContainer.appendChild(button2);
	buttonContainer.appendChild(button3);

	personContainer.appendChild(person);
	personContainer.appendChild(buttonContainer);

	peopleOnlineList.appendChild(personContainer);
	peopleOnlineList.scrollTop = peopleOnlineList.scrollHeight;
}

// function appendPerson(text: string): void {
//     const message = document.createElement("div");
//     message.classList.add("mb-2", "flex", "justify-end", "items-start");
//     message.setAttribute("data-person", text);
// 	message.innerHTML = `<span class="bg-blue-500 text-white p-2 rounded-lg">${text}</span>`;
// 	message.addEventListener("click", () => {
// 		alert('Friend request sent');
// 		// You can add more actions here
// 	});      
// 	peopleOnlineList.appendChild(message);
//     peopleOnlineList.scrollTop = peopleOnlineList.scrollHeight;
// }

function deletePerson(text: string): void 
{
	const personElement = peopleOnlineList.querySelector(`[data-person="${text}"]`);
	if (personElement) {
		peopleOnlineList.removeChild(personElement);
	} else {
		console.log(`Person with text "${text}" not found.`);
	}
}

function sendMessage(): void 
{
	if(chatPerson.textContent)
	{
		if(messageInput.value.trim() !== "")
		{
			socket.send(JSON.stringify({ type: 'chat', message: messageInput.value, nickname: nickname_input.value, friendNickname: chatPerson.textContent }));
			appendMessage(messageInput.value, true);
			messageInput.value = '';
		}
	}
}

const hideAllPages = () => // DONE
{
	nickname_page.style.display = 'none';
	game.style.display = 'none';
};

const showPage = (page: HTMLElement) => // DONE
{
	hideAllPages();
	page.style.display = 'block';
};

// ******** event listeners start here **************

sendButton.addEventListener("click", sendMessage);

// messageInput.addEventListener("keypress", (event: KeyboardEvent) => {
// 	if (event.key === "Enter") sendMessage();
// });

// friendRequestButton.addEventListener('click', () => 
// {
// 	if(friendRequestInput.value.trim() !== "")
// 	{
// 		socket.send(JSON.stringify({ type: 'friendRequest', friendNickname: friendRequestInput.value }));
// 		alert('Friend request sent');
// 		friendRequestInput.value = "";
// 	}
// });

nickname_button.addEventListener('click', () =>  //DONE
{
	if(nickname_input.value.trim() !== "")
	{
		socket.send(JSON.stringify({ microservice: 'chat', registration: true, nickname: nickname_input.value }));
	}
});

showPage(nickname_page);

socket.onmessage = (event) => 
{
	const data = JSON.parse(event.data);

	if(data.microservice === 'chat')
	{
		if(data.registration !== undefined)
		{
			if(data.registration === false)
			{
				alert('Nickname already exists');
				return;
			}
			tic.textContent = data.nickname;
			showPage(game);
			return;
		}
		if(data.updatePeopleOnline === true)
		{
			console.log('All clients:', data.clientsOnline);
			peopleOnlineList.innerHTML = '';
			data.clientsOnline.forEach((client: { nickname: string }) => {
				if(client.nickname !== tic.textContent)
				{
					appendPerson(client.nickname);
				}
			});
		}
		if(data.chatHistoryRequest)
		{
			chatBox.innerHTML = '';
			data.chatHistory.forEach((message: { text: string; isOwnMessage: boolean; }) => {
				appendMessage(message.text, message.isOwnMessage);
			});
			return;
		}
		// if(data.chatHistoryRequest)
		// {
		// 	currentConversation = data.chatingWith;
		// 	// displayMessages(data.chatingWith);
		// 	return;
		// }
		// if(blockedList.includes(data.nickname))
		// {
		// 	// alert('You have blocked this person');
		// 	return;
		// }
		// let incomingMessage: Message = {
		// 	text: data.message,
		// 	isOwnMessage: false
		// };
		
		// if (!messageHistories[data.nickname]) {
		// 	messageHistories[data.nickname] = [];
		// }
		// messageHistories[data.nickname].push(incomingMessage);
		// displayMessages(currentConversation);
		// if(chatPerson.textContent === data.nickname)
		// {
		// 	appendMessage(data.message, false);
		// 	return;
		// }
		// changePersonBackgroundColor(data.nickname, 'green');
		return;		
	}
	// if(data.peopleOnline)
	// {
	// 	appendPerson(data.nickname);
	// 	return;
	// }
	// if(data.peopleOnline === false)
	// {
	// 	deletePerson(data.nickname);
	// 	return;
	// }
}