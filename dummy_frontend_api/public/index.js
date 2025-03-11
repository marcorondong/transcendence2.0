"use strict";
const socket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/ws`);
const tic_socket = new WebSocket(`ws://${window.location.hostname}:3001/ws`);
const chat_socket = new WebSocket(`ws://${window.location.hostname}:3002/ws`);
window.onload = () => {
    const board = ["", "", "", "", "", "", "", "", ""];
    let gameActive = true;
    let player1Score = 0;
    let player2Score = 0;
    let youAre = 'X';
    let opponent = 'O';
    let aiFlag = false;
    let aiIndexOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    let aiIndex = 0;
    const nickname_page = document.getElementById('nickname_page');
    const nickname_input = document.getElementById('nickname_input');
    const nickname_button = document.getElementById('nickname_button');
    const me = document.getElementById('me');
    const gamePage = document.getElementById('gamePage');
    const cells = document.querySelectorAll('.cell');
    const player1_name = document.getElementById('player1_name');
    const player2_name = document.getElementById('player2_name');
    const player1_score = document.getElementById('player1_score');
    const player2_score = document.getElementById('player2_score');
    const playWith = document.getElementById('playWith');
    const info = document.getElementById('info');
    const rematchButton = document.getElementById('rematchButton');
    const leaveButton = document.getElementById('leaveButton');
    const acceptRematchButton = document.getElementById('acceptRematchButton');
    const declineRematchButton = document.getElementById('declineRematchButton');
    const cancelRematchButton = document.getElementById('cancelRematchButton');
    const rematchRequestSender = document.getElementById('rematchRequestSender');
    const rematchRequestReceiver = document.getElementById('rematchRequestReceiver');
    const loadingPage_tic = document.getElementById('loadingPage_tic');
    const cancelButton = document.getElementById('cancelButton');
    const customisePage = document.getElementById('customisePage');
    const playOnlineButton = document.getElementById('playOnlineButton');
    const playWithAIButton = document.getElementById('playWithAIButton');
    const playTournamentButton = document.getElementById('playTournamentButton');
    const createNewTournamentButton = document.getElementById('createNewTournamentButton');
    const notificationMap = new Map();
    const chat = document.getElementById("chat");
    const messageInput = document.getElementById("message-input");
    const chatBox = document.getElementById("chat-box");
    const sendButton = document.getElementById("send-button");
    const chatPerson = document.getElementById("chatPerson");
    const peopleOnlineList = document.getElementById("peopleOnlineList");
    const notificationList = document.getElementById("notificationList");
    const peopleOnlineDiv = document.getElementById('peopleOnlineDiv');
    const notificationDiv = document.getElementById('notificationDiv');
    const chatBackButton = document.getElementById('chatBackButton');
    const infoButton = document.getElementById('infoButton');
    const inviteButton = document.getElementById('inviteButton');
    const blockButton = document.getElementById('blockButton');
    const notifBackButton = document.getElementById('notifBackButton');
    const notifButton = document.getElementById('notifButton');
    const loadingPage_chat = document.getElementById('loadingPage_chat');
    const cancelLoadingButton = document.getElementById('cancelLoadingButton');
    function appendMessage(message, isOwn) {
        const newMessage = document.createElement("div");
        newMessage.classList.add("mb-2", "flex", isOwn ? "justify-end" : "justify-start", "items-start");
        newMessage.innerHTML = `<span class="${isOwn ? "bg-blue-500 text-white" : "bg-gray-200"} p-2 rounded-lg max-w-xs break-words">${message}</span>`;
        chatBox.appendChild(newMessage);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    function appendNotification(person, text, invitation) {
        const NotificationContainer = document.createElement("div");
        NotificationContainer.classList.add("items-center", "p-4", "hover:bg-gray-100", "cursor-pointer");
        const newNotification = document.createElement("div");
        newNotification.classList.add("text-lg", "font-semibold", "text-gray-900", "flex-grow", "break-words");
        newNotification.textContent = person + text;
        NotificationContainer.appendChild(newNotification);
        if (invitation) {
            const buttonContainer = document.createElement("div");
            buttonContainer.classList.add("flex", "items-center");
            const acceptButton = document.createElement("button");
            acceptButton.classList.add("px-4", "py-2", "bg-green-500", "text-white", "rounded-lg", "hover:bg-green-600", "focus:outline-none");
            acceptButton.textContent = "Accept";
            acceptButton.addEventListener("click", () => {
                chat_socket.send(JSON.stringify({ microservice: 'chat', startGame: person }));
                appendNotification(person, ' \'s invitation accepted', false);
                buttonContainer.remove();
            });
            const rejectButton = document.createElement("button");
            rejectButton.classList.add("px-4", "py-2", "bg-red-500", "text-white", "rounded-lg", "hover:bg-red-600", "focus:outline-none", "ml-2");
            rejectButton.textContent = "Reject";
            rejectButton.addEventListener("click", () => {
                chat_socket.send(JSON.stringify({ microservice: 'chat', notification: ' rejected your invitation', receiver: person }));
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
    function appendPerson(text) {
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
            chat_socket.send(JSON.stringify({ microservice: 'chat', chatHistoryRequest: true, chattingWith: text }));
            newMessageIndicator.classList.add("hidden");
        });
        peopleOnlineList.appendChild(personContainer);
        peopleOnlineList.scrollTop = peopleOnlineList.scrollHeight;
    }
    function deletePerson(text) {
        const personElement = peopleOnlineList.querySelector(`[data-person="${text}"]`);
        if (personElement) {
            peopleOnlineList.removeChild(personElement);
        }
        else {
            alert('Warning: Person not found');
        }
    }
    function deleteButtonContainer(text) {
        const buttonContainer = notificationMap.get(text);
        if (buttonContainer) {
            buttonContainer.remove();
            notificationMap.delete(text);
        }
        else {
            alert('Warning: Button container not found');
        }
    }
    function updateNewMessageIndicator(person, hasNewMessage) {
        const personElement = peopleOnlineList.querySelector(`[data-person="${person}"]`);
        if (personElement) {
            const newMessageIndicator = personElement.querySelector('.new-message-indicator');
            if (newMessageIndicator) {
                if (hasNewMessage) {
                    newMessageIndicator.classList.remove('hidden');
                    newMessageIndicator.classList.add('bg-green-500');
                }
                else {
                    newMessageIndicator.classList.add('hidden');
                    newMessageIndicator.classList.remove('bg-green-500');
                }
            }
        }
    }
    function sendMessage() {
        if (chatPerson.textContent) {
            if (messageInput.value.trim() !== "") {
                if (blockButton.style.backgroundColor === 'green') {
                    alert('You have blocked this person. Unblock to send message');
                    return;
                }
                chat_socket.send(JSON.stringify({ microservice: 'chat', message: messageInput.value, receiver: chatPerson.textContent }));
                appendMessage(messageInput.value, true);
                messageInput.value = '';
            }
        }
    }
    const hideAllPages = () => {
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
    };
    const hideAllPagesChat = () => {
        peopleOnlineDiv.style.display = 'none';
        notificationDiv.style.display = 'none';
        chat.style.display = 'none';
    };
    const showPage = (page) => {
        hideAllPages();
        page.style.display = 'block';
    };
    const showPageChat = (page) => {
        hideAllPagesChat();
        page.style.display = 'block';
    };
    sendButton.addEventListener("click", sendMessage);
    cancelLoadingButton.addEventListener('click', () => {
        chat_socket.send(JSON.stringify({ microservice: 'chat', invitationCanceled: chatPerson.textContent }));
        appendNotification('', 'you have canceled the invitation', false);
        showPageChat(peopleOnlineDiv);
    });
    notifButton.addEventListener('click', () => {
        showPageChat(notificationDiv);
    });
    notifBackButton.addEventListener('click', () => {
        showPageChat(peopleOnlineDiv);
    });
    chatBackButton.addEventListener('click', () => {
        chatPerson.textContent = '';
        chatBox.innerHTML = '';
        showPageChat(peopleOnlineDiv);
    });
    infoButton.addEventListener('click', () => {
        if (blockButton.style.backgroundColor === 'green') {
            alert('You have blocked this person. Unblock to view info');
            return;
        }
        alert('This is ' + chatPerson.textContent + '. He is hopefully a good guy');
    });
    inviteButton.addEventListener('click', () => {
        if (blockButton.style.backgroundColor === 'green') {
            alert('You have blocked this person. Unblock to invite');
            return;
        }
        appendNotification(chatPerson.textContent ?? '', ' has been invited to play PingPong', false);
        chat_socket.send(JSON.stringify({ microservice: 'chat', inviteThisPerson: chatPerson.textContent }));
        showPageChat(loadingPage_chat);
    });
    blockButton.addEventListener('click', () => {
        if (blockButton.style.backgroundColor === 'white')
            chat_socket.send(JSON.stringify({ microservice: 'chat', blockThisPerson: chatPerson.textContent }));
        else if (blockButton.style.backgroundColor === 'green')
            chat_socket.send(JSON.stringify({ microservice: 'chat', unblockThisPerson: chatPerson.textContent }));
        else {
            alert('Something went wrong. Expected blockButton color is green or white, but found ' + blockButton.style.backgroundColor);
            chat_socket.send(JSON.stringify({ microservice: 'chat', error: 'Something went wrong. Expected blockButton color is green or white, but found ' + blockButton.style.backgroundColor }));
        }
    });
    function ft_aiMove() {
        let index_ai_options = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        let index_ai = index_ai_options[Math.floor(Math.random() * index_ai_options.length)];
        while (board[index_ai] !== "") {
            index_ai_options.filter(item => item !== index_ai);
            index_ai = index_ai_options[Math.floor(Math.random() * index_ai_options.length)];
        }
        board[index_ai] = opponent;
        cells[index_ai].textContent = opponent;
        if (checkWinner()) {
            gameActive = false;
            info.textContent = 'You lose';
            alert('You lose');
            player2_score.textContent = (++player2Score).toString();
            return;
        }
        if (board.every(cell => cell !== "")) {
            gameActive = false;
            info.textContent = 'It is draw';
            alert('It is draw');
            return;
        }
        info.textContent = 'Your turn';
    }
    function ft_playWithAI() {
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
        showPage(gamePage);
        showPageChat(peopleOnlineDiv);
        if (youAre === 'O') {
            ft_aiMove();
        }
    }
    function handleCellClick(event) {
        const cell = event.target;
        const index = Number(cell.dataset.index);
        if (board[index] || !gameActive) {
            cell.classList.add('hover:bg-red-100');
            return;
        }
        board[index] = youAre;
        cell.textContent = youAre;
        if (checkWinner()) {
            gameActive = false;
            if (!aiFlag)
                tic_socket.send(JSON.stringify({ microservice: 'tictactoe', yourTurn: true, index: index, gameStatus: 'You lose' }));
            info.textContent = 'You win';
            alert('You win');
            player1_score.textContent = (++player1Score).toString();
            return;
        }
        if (board.every(cell => cell !== "")) {
            gameActive = false;
            if (!aiFlag)
                tic_socket.send(JSON.stringify({ microservice: 'tictactoe', yourTurn: true, index: index, gameStatus: 'It is draw' }));
            info.textContent = 'It is draw';
            alert('It is draw');
            return;
        }
        info.textContent = 'Opponent\'s turn';
        if (aiFlag) {
            ft_aiMove();
            return;
        }
        gameActive = false;
        tic_socket.send(JSON.stringify({ microservice: 'tictactoe', yourTurn: true, index: index }));
    }
    function checkWinner() {
        const winPatterns = [
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
    function ft_cancelLookingForGame() {
        tic_socket.send(JSON.stringify({ microservice: 'tictactoe', cancelLookingForGame: true }));
        showPage(customisePage);
    }
    function ft_lookingForGame() {
        aiFlag = false;
        tic_socket.send(JSON.stringify({ microservice: 'tictactoe', lookingForGame: true }));
        showPage(loadingPage_tic);
    }
    function ft_leaveRoom() {
        tic_socket.send(JSON.stringify({ microservice: 'tictactoe', leftRoom: true }));
        board.fill("");
        cells.forEach(cell => cell.textContent = "");
        player1Score = 0;
        player2Score = 0;
        player1_score.textContent = '0';
        player2_score.textContent = '0';
        gameActive = true;
        showPage(customisePage);
    }
    function ft_rematchRequest() {
        if (aiFlag) {
            board.fill("");
            cells.forEach(cell => cell.textContent = "");
            youAre = youAre === 'X' ? 'O' : 'X';
            opponent = youAre === 'X' ? 'O' : 'X';
            playWith.textContent = youAre;
            gameActive = true;
            info.textContent = youAre === 'X' ? 'Your turn' : 'Opponent\'s turn';
            if (youAre === 'O') {
                ft_aiMove();
            }
            return;
        }
        rematchRequestSender.style.display = 'block';
        rematchRequestReceiver.style.display = 'none';
        tic_socket.send(JSON.stringify({ microservice: 'tictactoe', rematchRequest: true }));
    }
    function ft_rematchRequestAccepted() {
        board.fill("");
        cells.forEach(cell => cell.textContent = "");
        gameActive = true;
        youAre = youAre === 'X' ? 'O' : 'X';
        opponent = youAre === 'X' ? 'O' : 'X';
        playWith.textContent = youAre;
        info.textContent = youAre === 'X' ? 'Your turn' : 'Opponent\'s turn';
        rematchRequestSender.style.display = 'none';
        rematchRequestReceiver.style.display = 'none';
        tic_socket.send(JSON.stringify({ microservice: 'tictactoe', rematchRequestAccepted: true, yourSymbol: youAre === 'X' ? 'O' : 'X' }));
        gameActive = youAre === 'X' ? true : false;
        showPage(gamePage);
        showPageChat(peopleOnlineDiv);
    }
    function ft_cancelRematchRequest() {
        rematchRequestSender.style.display = 'none';
        rematchRequestReceiver.style.display = 'none';
        tic_socket.send(JSON.stringify({ microservice: 'tictactoe', rematchRequestCanceled: true }));
    }
    cells.forEach(cell => {
        cell.addEventListener('mouseenter', (event) => {
            const target = event.target;
            const index = Number(target.dataset.index);
            if (board[index]) {
                target.classList.add('hover:bg-red-100');
            }
        });
        cell.addEventListener('mouseleave', (event) => {
            const target = event.target;
            target.classList.remove('hover:bg-red-100');
        });
        cell.addEventListener('click', handleCellClick);
    });
    nickname_button.addEventListener('click', () => {
        if (nickname_input.value.trim() !== "") {
            tic_socket.send(JSON.stringify({ microservice: 'tictactoe', registration: true, nickname: nickname_input.value }));
            chat_socket.send(JSON.stringify({ microservice: 'chat', registerThisPerson: nickname_input.value }));
        }
        else {
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
    showPage(nickname_page);
    tic_socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.microservice === 'tictactoe') {
            if (data.registration !== undefined) {
                if (data.registration === false) {
                    alert('Nickname already exists');
                    return;
                }
                player1_name.textContent = data.nickname;
                showPage(customisePage);
                return;
            }
            if (data.startGame) {
                player2_name.textContent = data.friendNickname;
                youAre = data.yourSymbol;
                opponent = youAre === 'X' ? 'O' : 'X';
                playWith.textContent = youAre;
                gameActive = youAre === 'X' ? true : false;
                info.textContent = youAre === 'X' ? 'Your turn' : 'Opponent\'s turn';
                showPage(gamePage);
                showPageChat(peopleOnlineDiv);
                return;
            }
            if (data.yourTurn) {
                board[data.index] = opponent;
                cells[data.index].textContent = opponent;
                if (checkWinner()) {
                    gameActive = false;
                    info.textContent = 'You lose';
                    alert('You lose');
                    player2_score.textContent = (++player2Score).toString();
                    return;
                }
                if (board.every(cell => cell !== "")) {
                    gameActive = false;
                    info.textContent = 'It is draw';
                    alert('It is draw');
                    return;
                }
                gameActive = true;
                info.textContent = 'Your turn';
                return;
            }
            if (data.leftRoom) {
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
            if (data.rematchRequest) {
                rematchRequestSender.style.display = 'none';
                rematchRequestReceiver.style.display = 'block';
                return;
            }
            if (data.rematchRequestAccepted) {
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
                return;
            }
            if (data.rematchRequestCanceled) {
                rematchRequestSender.style.display = 'none';
                rematchRequestReceiver.style.display = 'none';
                return;
            }
        }
    };
    chat_socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.microservice) {
            if (data.microservice === 'chat') {
                if (data.message) {
                    if (data.sender === chatPerson.textContent)
                        appendMessage(data.message, false);
                    else
                        updateNewMessageIndicator(data.sender, true);
                    return;
                }
                else if (data.chatHistoryProvided) {
                    chatBox.innerHTML = '';
                    data.chatHistoryProvided.forEach((message) => {
                        appendMessage(message.text, message.isOwn);
                    });
                    console.log('aaaaaaaaaaaa' + data.block);
                    if (data.block === true) {
                        blockButton.style.backgroundColor = 'green';
                    }
                    else if (data.block === false) {
                        blockButton.style.backgroundColor = 'white';
                    }
                    showPageChat(chat);
                    return;
                }
                else if (data.newClientOnline) {
                    appendPerson(data.newClientOnline);
                    return;
                }
                else if (data.clientDisconnected) {
                    if (data.nickname === chatPerson.textContent) {
                        alert(data.nickname + ' has disconnected');
                        showPageChat(peopleOnlineDiv);
                    }
                    deletePerson(data.nickname);
                    return;
                }
                else if (data.registrationApproved && data.clientsOnline) {
                    me.textContent = data.registrationApproved;
                    data.clientsOnline.forEach((client) => {
                        appendPerson(client.nickname);
                    });
                    return;
                }
                else if (data.registrationDeclined) {
                    alert(data.registrationDeclined);
                    return;
                }
                else if (data.thisPersonBlocked) {
                    alert('You have blocked ' + data.thisPersonBlocked);
                    if (data.thisPersonBlocked === chatPerson.textContent) {
                        blockButton.style.backgroundColor = 'green';
                    }
                    return;
                }
                else if (data.thisPersonUnblocked) {
                    alert('You have unblocked ' + data.thisPersonUnblocked);
                    if (data.thisPersonUnblocked === chatPerson.textContent) {
                        blockButton.style.backgroundColor = 'white';
                    }
                    return;
                }
                else if (data.thisPersonInvitedYou) {
                    appendNotification(data.thisPersonInvitedYou, ' has invited you to play PingPong', true);
                    return;
                }
                else if (data.invitationCanceled) {
                    alert(data.invitationCanceled + ' has canceled the invitation');
                    appendNotification(data.invitationCanceled, ' has canceled the invitation', false);
                    deleteButtonContainer(data.invitationCanceled);
                    showPageChat(peopleOnlineDiv);
                    return;
                }
                else if (data.notification) {
                    appendNotification(data.sender, data.notification, false);
                    return;
                }
                else if (data.startGame) {
                    showPageChat(peopleOnlineDiv);
                    window.open(data.startGame, '_blank');
                }
                else {
                    chat_socket.send(JSON.stringify({ microservice: 'error', errorMessage: 'Error: "chat" microservice has no such request handler in client side sent by server to client under received "microservice": "chat" request in client side', sentData: data }));
                    alert('Error: "chat" microservice has no such request handler in client side sent by server to client under received "microservice": "chat" request in client side');
                    return;
                }
            }
            else if (data.microservice === 'error') {
                if (data.errorMessage) {
                    alert(data.error);
                }
                else {
                    chat_socket.send(JSON.stringify({ microservice: 'error', errorMessage: 'Error: "errorMessage" property is not found in the data sent by server to client under received "microservice": "error" request in client side', sentData: data }));
                    alert('Something went wrong. "errorMessage" property is not found in the data sent by server');
                }
                return;
            }
            else {
                chat_socket.send(JSON.stringify({ microservice: 'error', errorMessage: `Error: server sent client data with unknown microservice: ${data.microservice}`, sentData: data }));
                alert(`Something went wrong. server sent client data with undefined microservice: ${data.microservice}`);
            }
        }
        else {
            chat_socket.send(JSON.stringify({ microservice: 'error', errorMessage: 'Error: "microservice" property is not found or has falsy value in the data sent by server to client', sentData: data }));
            alert('Something went wrong. "microservice" property is not found in the data sent by server');
        }
    };
};
//# sourceMappingURL=index.js.map