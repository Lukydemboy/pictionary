const currentRoundDOM = document.getElementById('currentRound');
const maxRoundDOM     = document.getElementById('maxRound');

startGameBtn.addEventListener('click', e => {
    e.preventDefault();

    if (user.username === user.currentRoom.host) {
        socket.emit('starting game', user.currentRoom);
    }

});

// Game is ready to start
socket.on('game starting', startingRoom => {

    // Show game and hide lobby
    lobbyDOM.classList.add('hide');
    gameWrapper.classList.remove('hide');

    user.playingRoom = startingRoom;

    // Set rounds
    currentRoundDOM.innerHTML = '1';
    maxRoundDOM.innerHTML = `/${startingRoom.rounds}`;

    // Set timer for choosing a word
    drawingTimer.innerHTML = 15;
    drawingTimer.classList.remove('single-digit')

    // only show word selection to drawingUser else show player X is picking a word
    if (user.username == user.playingRoom.drawingUser) {
        fetchWords(choosingWordDOM);

        choosingWordDOM.classList.remove('hide');

        wordPickingTimeOut = setTimeout(() => {
            if (!user.playingRoom.wordChosen) {
                const randomWordIndex = wordsDOM[Math.floor(Math.random() * wordsDOM.length)];
                randomWordIndex.click();
                clearTimeout(wordPickingTimeOut);
            }
        }, 15000);

    } else {
        // Show player X is picking a word
        playerChoosingMsg.innerHTML = `${user.playingRoom.drawingUser} is choosing a word!`;

        playerChoosingDOM.classList.remove('hide');

    }

    for (let i = 0; i < wordsDOM.length; i++) {
        wordsDOM[i].addEventListener('click', e => {
            const source = e.target.closest('.word');
            const chosenWord = source.dataset.word;

            choosingWordDOM.classList.add('hide');

            user.playingRoom.wordChosen = true;

            socket.emit('word chosen', user.playingRoom, chosenWord);

            // Set chosen word in DOM
            currentWordDOM.innerHTML = chosenWord;

            clearTimeout(wordPickingTimeOut);
        });
    }

    createPlayerList();

});

socket.on('need more players', () => {
    notificate('warning', `There must be 2 or more players in your room to start the game!`);
});

function createPlayerList() {
    playerListDOM.innerHTML = '';

    // Add all players to player list
    const allPlayers = user.playingRoom.players;

    for (let i = 0; i < allPlayers.length; i++) {
        const currentPlayer = allPlayers[i];

        const playerWrapper = document.createElement('div');
        playerWrapper.classList.add('players-list-player');
        playerWrapper.id = `player-${currentPlayer.username}`;

        const playerAvatar = document.createElement('div');
        playerAvatar.classList.add('player--avatar');
        playerAvatar.innerHTML = 'Avatar';

        const playerInfo = document.createElement('div');
        playerInfo.classList.add('player--info');

        const playerName = document.createElement('div');
        const playerScore = document.createElement('div');

        playerScore.id = `score-${currentPlayer.username}`;

        playerName.classList.add('name');
        playerScore.classList.add('score');

        playerName.innerHTML = currentPlayer.username;
        playerScore.innerHTML = '0';

        playerInfo.appendChild(playerName);
        playerInfo.appendChild(playerScore);

        playerWrapper.appendChild(playerAvatar);
        playerWrapper.appendChild(playerInfo);

        playerListDOM.appendChild(playerWrapper);

    }
}