const lobbyChat = document.getElementById('lobbyChatMessages'); 
const lobbyChatSend = document.getElementById('sendLobbyMessage');
const lobbyChatInput = document.getElementById('lobbySend');
const lobbyChatForm = document.getElementById('lobbyChatForm');


// Send chat message in lobby
lobbyChatForm.addEventListener('submit', e => {
    e.preventDefault();

    console.log(lobbyChatInput);
    const message = lobbyChatInput.value;

    if (message === '') return;

    const playerMessage = document.createElement('li');
    playerMessage.classList.add('chat__message');
    playerMessage.innerHTML = `<span class="message__sender">${user.username}:</span>${message}`;

    lobbyChatMessages.appendChild(playerMessage);

    lobbyChatInput.value = '';

    socket.emit('send lobby message', message, user);
    updateLobbyChatScroll();

});

// Lobby chat message has been received
socket.on('lobby message received', (message, sender) => {
    const playerMessage = document.createElement('li');

    playerMessage.classList.add('chat__message');
    playerMessage.innerHTML = `<span class="message__sender">${sender.username}:</span>${message}`;

    lobbyChatMessages.appendChild(playerMessage);
    updateLobbyChatScroll();
});

// Make the chat automatically scroll to the bottom 
function updateLobbyChatScroll() {
    const element = document.getElementById("lobbyChatMessages");
    element.scrollTop = element.scrollHeight;
}
