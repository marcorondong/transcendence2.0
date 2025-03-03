const socket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/ws`);

window.onload = () => {

const chat = document.getElementById("chat") as HTMLDivElement;
const messageInput = document.getElementById("message-input") as HTMLInputElement;
const chatBox = document.getElementById("chat-box") as HTMLDivElement;
const sendButton = document.getElementById("send-button") as HTMLButtonElement;
const chatPerson = document.getElementById("chatPerson")!;
const peopleOnlineList = document.getElementById("peopleOnlineList") as HTMLDivElement;
const nickname_page = document.getElementById('nickname_page') as HTMLDivElement;
const nickname_input = document.getElementById('nickname_input') as HTMLInputElement;
const nickname_button = document.getElementById('nickname_button') as HTMLButtonElement;
const me = document.getElementById('me')!;
const peopleOnlineDiv = document.getElementById('peopleOnlineDiv') as HTMLDivElement;

const backButton = document.getElementById('backButton') as HTMLButtonElement;
const infoButton = document.getElementById('infoButton') as HTMLButtonElement;
const inviteButton = document.getElementById('inviteButton') as HTMLButtonElement;
const blockButton = document.getElementById('blockButton') as HTMLButtonElement;

function appendMessage(message: string, isOwn: boolean): void // DONE
{
	const newMessage = document.createElement("div");
	newMessage.classList.add("mb-2", "flex", isOwn ? "justify-end" : "justify-start", "items-start");
	newMessage.innerHTML = `<span class="${isOwn ? "bg-blue-500 text-white" : "bg-gray-200"} p-2 rounded-lg">${message}</span>`;
	chatBox.appendChild(newMessage);
	chatBox.scrollTop = chatBox.scrollHeight;
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

function appendPerson(text: string): void {
    const personContainer = document.createElement("div");
    personContainer.classList.add("flex", "items-center", "p-4", "hover:bg-gray-100", "cursor-pointer");
    personContainer.setAttribute("data-person", text);

    const personName = document.createElement("div");
    personName.classList.add("text-lg", "font-semibold", "text-gray-900", "flex-grow");
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

function sendMessage(): void 
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
			socket.send(JSON.stringify({ microservice: 'chat', message: messageInput.value, sender: me.textContent, receiver: chatPerson.textContent }));
			appendMessage(messageInput.value, true);
			messageInput.value = '';
		}
	}
}

const hideAllPages = () => // DONE
{
	nickname_page.style.display = 'none';
	chat.style.display = 'none';
	peopleOnlineDiv.style.display = 'none';
};

const showPage = (page: HTMLElement) => // DONE
{
	hideAllPages();
	page.style.display = 'block';
};

// ******** event listeners start here **************

sendButton.addEventListener("click", sendMessage);

backButton.addEventListener('click', () => 
{
	chatPerson.textContent = '';
	// chatBox.innerHTML = '';
	showPage(peopleOnlineDiv);
});

infoButton.addEventListener('click', () => 
{
	if(blockButton.style.backgroundColor === 'green')
	{
		alert('You have blocked this person. Unblock to view info');
		return;
	}
	alert('This is ' + chatPerson.textContent + '. He is hopefully a good guy');
});

inviteButton.addEventListener('click', () => 
{
	if(blockButton.style.backgroundColor === 'green')
	{
		alert('You have blocked this person. Unblock to invite');
		return;
	}
	alert('You invited ' + chatPerson.textContent + ' to play PingPong');
	appendMessage('You invited ' + chatPerson.textContent, true);
	const inviteMessage = ' You are invited by ' + me.textContent;
	socket.send(JSON.stringify({ microservice: 'chat', message: inviteMessage, sender: me.textContent, receiver: chatPerson.textContent }));
});

blockButton.addEventListener('click', () => 
{
	if(blockButton.style.backgroundColor === 'green')
	{
		alert('You have unblocked ' + chatPerson.textContent);
		blockButton.style.backgroundColor = 'white';
		socket.send(JSON.stringify({ microservice: 'chat', unblock: true, nickname: me.textContent, unblockedPerson: chatPerson.textContent }));
		return;
	}
	alert('You have blocked ' + chatPerson.textContent);
	blockButton.style.backgroundColor = 'green';
	socket.send(JSON.stringify({ microservice: 'chat', block: true, nickname: me.textContent, blockedPerson: chatPerson.textContent }));
});

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
			me.textContent = data.nickname;
			data.clientsOnline.forEach((client: { nickname: string }) => {
				appendPerson(client.nickname);
			});
			showPage(peopleOnlineDiv);
			return;
		}
		if(data.clientDisconnected)
		{
			if(data.nickname === chatPerson.textContent)
			{
				chatPerson.textContent = '';
				chatBox.innerHTML = '';
				showPage(peopleOnlineDiv);
			}
			deletePerson(data.nickname);
			return;
		}
		if(data.newClientOnline === true)
		{
			appendPerson(data.nickname);
			return;
		}
		if(data.chatHistoryRequest)
		{
			chatBox.innerHTML = '';
			console.log('Chat history:', data.chatHistory);
			data.chatHistory.forEach((message: { text: string; isOwn: boolean; }) => {
				appendMessage(message.text, message.isOwn);
			});
			if(data.block)
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
		if(data.message)
		{
			if(data.sender === chatPerson.textContent)
			{
				appendMessage(data.message, false);
				return;
			}
			updateNewMessageIndicator(data.sender, true);
			return;
		}
		return;		
	}
}
};