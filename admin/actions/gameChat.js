const gameChatDOM = document.getElementById('gameChatForm');
const gameChatInput = document.getElementById('gameSend');
const gameChatMessages = document.getElementById('gameChatMessages');

// Handle in-game chat
gameChatDOM.addEventListener('submit', e => {
    e.preventDefault();

    // Get message from input and clear it afterwards
    const message = gameChatInput.value;
    gameChatInput.value = '';

    const senderMessage = `
                            <li class="game-chat__message"><span>${user.username}:</span>${message}</li>
                          `;

    // Add message to the chat (send only)
    gameChatMessages.insertAdjacentHTML('beforeend', senderMessage);

    socket.emit('send game message', user, message);

    updateGameChatScroll();
});

socket.on('game chat message', (sendingUser, message) => {

  const recevingMessage = `
                            <li class="game-chat__message"><span>${sendingUser.username}:</span>${message}</li>
                          `;
  gameChatMessages.insertAdjacentHTML('beforeend', recevingMessage);

  updateGameChatScroll();

});


function updateGameChatScroll() {
  const element = document.getElementById("gameChatMessages");
  element.scrollTop = element.scrollHeight;
}
