// Game QuerySelectors
const gameWrapper = document.getElementsByClassName('game__wrapper')[0];
const gameCanvas = document.getElementById('canvasWrapper');
const choosingWordDOM = document.getElementsByClassName('choosing__word--overlay')[0];
const playerChoosingDOM = document.getElementsByClassName('player-choosing--overlay')[0];
const scoreOverlayDOM = document.getElementsByClassName('score--overlay')[0];
const gameEndWrapper = document.getElementById('gameEndWrapper');
const playerChoosingMsg = document.getElementById('playerChoosingMessage');

const drawingTimer = document.getElementById('gameDrawingTimer');
const playerListDOM = document.getElementById('playerList');
const scoreboardDOM = document.getElementById('scoreboard');
const gameEndScoreboardDOM = document.getElementById('gameEndScoreboard');
const currentWordDOM = document.getElementById('currentWord');

// Canvas
const clearBtnDOM = document.getElementById('clear');

// Choosing words DOM
const wordsDOM = document.getElementsByClassName('word');

socket.on('word found', (sendingUser, totalScore, thisRoundScore, word) => {
    user.playingRoom = sendingUser.playingRoom;

    // Make word visible for the user who found the word
    if (sendingUser.username === user.username) {
        currentWordDOM.innerHTML = word;
    }

    // Add score to playerlist (HTML)
    const userScore = document.getElementById(`score-${sendingUser.username}`);
    userScore.innerHTML = totalScore;

    // Add score to the drawing user in HTML
    const drawingUserScore = document.getElementById(`score-${sendingUser.playingRoom.drawingUser}`);
    const newDrawingUserScore = parseInt(drawingUserScore.innerHTML) + 50;
    drawingUserScore.innerHTML = newDrawingUserScore;

    // user.playingRoom.playersThatFoundWord = [...sendingUser.playingRoom.playersThatFoundWord];
    audio = new Audio('assets/sound/success.wav');
    audio.addEventListener("canplaythrough", event => {
        audio.play();
    });

    // Add green background to the player who got the word correct
    document.getElementById(`player-${sendingUser.username}`).classList.add('success');
});

socket.on('next player', nextRoom => {
    
    // Clear the canvas
    clearBtnDOM.click();

    // Set current in HTML
    currentRoundDOM.innerHTML = nextRoom.round;

    user.playingRoom = nextRoom;

    // only show word selection to drawingUser else show 'player X is picking a word'
    if (user.username == user.playingRoom.drawingUser) {
        fetchWords(choosingWordDOM);

        choosingWordDOM.classList.remove('hide');

        // automatically click a word after 15 seconds idle
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


});

socket.on('player starts drawing', hiddenWord => {
    user.playingRoom.wordChosen = true;

    playerChoosingDOM.classList.add('hide');

    // Clear all green backgrounds
    const greenUsersDOM = document.getElementsByClassName('players-list-player');

    for (let i = 0; i < greenUsersDOM.length; i++) {
        greenUsersDOM[i].classList.remove('success');
    }

    // Set hidden word for the guessers
    if (user.username != user.playingRoom.drawingUser) currentWordDOM.innerHTML = hiddenWord;

    // Set timers
    if (user.playingRoom.drawTime > 9) {
        drawingTimer.classList.remove('single-digit');
    } else {
        drawingTimer.classList.add('single-digit');
    }

    drawingTimer.innerHTML = user.playingRoom.drawTime;
    user.playingRoom.drawingDuration = user.playingRoom.drawTime;

    if (roundTimer) {
        clearTimer(roundTimer);
    }

    roundTimer = setInterval(() => { setTimer() }, 1000);;

});

socket.on('drawing end', room => {
    drawingEnd(room);
});

socket.on('game ending', endingRoom => {
    makeEndScoreboard(endingRoom.players);

    setTimeout(() => { 
        gameEndWrapper.innerHTML = '';
        backToLobby();

        if (user.currentRoom.host === user.username) {
            socket.emit('game ended', user.playingRoom.name);
        }
        
        gameEndWrapper.classList.add('hide');

    }, 5000);

});

function drawingEnd(room) {

    // Adding player to players who have drew in this round
    room.playersThatDrew.push(room.drawingUser);

    // Delete drawinguser out of queue
    const drawingUserIndex = room.drawQueue.indexOf(room.drawingUser);
    room.drawQueue.splice(drawingUserIndex, 1);

    room.drawingUser = '';
    
    makeScoreboard(room.players, scoreboardDOM);

    showScoreboard(scoreOverlayDOM);

    // Wait 5 seconds to show new words
    setTimeout(() => {

        // set DrawingTimer to 20 sec. So they know when the next word has been chosen
        // Scoreboard is shown for 5 seconds, autopick from words is 15 seconds
        drawingTimer.innerHTML = 20;

        // Hide scoreboard
        scoreOverlayDOM.classList.add('hide');

        // New player can draw now (check for host, so that the request only is send once)
        if (user.username === room.host) {
            if (room.drawQueue.length === 0) {
                socket.emit('start new round', room);
            } else {
                socket.emit('start next player', room);
            }
        }
        
    }, 5000);

}

function setTimer() {
    // Start timer
    let drawingDuration = parseInt(user.playingRoom.drawingDuration) - 1;
    if (drawingDuration >= 0) {
        user.playingRoom.drawingDuration = drawingDuration;

        if (user.playingRoom.drawingDuration > 9) {
            drawingTimer.classList.remove('single-digit');
        } else if (user.playingRoom.drawingDuration === 0) {
            drawingEnd(user.playingRoom);
        } else {
            drawingTimer.classList.add('single-digit');
        }

        drawingTimer.innerHTML = user.playingRoom.drawingDuration;
    }
}

function clearTimer(timer) {
    clearInterval(timer);
}

function backToLobby() {
    // Hide all overlays
    hideGameElements();

    gameWrapper.classList.add('hide');

    // Show Lobby
    lobbyDOM.classList.remove('hide');
}

function showScoreboard(scoreBoardNode) {
    scoreBoardNode.classList.remove('hide');
}

function makeScoreboard(players, node) {
    scoreboardDOM.innerHTML = '';

    const orderedPlayers = [];

    for (let i = 0; i < players.length; i++) {
        const currentPlayer = players[i];
        let inserted = false;

        if (!currentPlayer) return;

        // Loop over players to check if score is higher, if is higher add to that position
        for (let x = 0; x < orderedPlayers.length; x++) {
            const orderedPlayer = orderedPlayers[x];

            if (orderedPlayer.score < currentPlayer.score) {
                orderedPlayers.splice(x, 0, currentPlayer);
                inserted = true;
                break;
            }
        }

        // If not inserted already -> add to end of array (score is lower than inserted players)
        if (!inserted) {
            orderedPlayers.push(currentPlayer);
        }

    }

    orderedPlayers.forEach(player => {

        // add players to scoreboard
        const scoreboardPlayerWrapper = document.createElement('div');
        scoreboardPlayerWrapper.classList.add('score-player');

        const scoreboardAvatar = document.createElement('div');
        scoreboardAvatar.classList.add('avatar');
        scoreboardAvatar.innerHTMl = 'Avatar';

        const scoreboardName = document.createElement('div');
        scoreboardName.classList.add('name');
        scoreboardName.innerHTML = player.username;

        const scoreboardScore = document.createElement('div');
        scoreboardScore.classList.add('score');
        if (!player.score) player.score = 0;
        scoreboardScore.innerHTML = player.score;

        const scoreboardScoreChange = document.createElement('div');
        scoreboardScoreChange.classList.add('score-change');
        if (!player.scoreChange) player.scoreChange = 0;
        scoreboardScoreChange.innerHTML = `+${player.scoreChange}`;
        player.scoreChange = 0;

        scoreboardScore.appendChild(scoreboardScoreChange);

        scoreboardPlayerWrapper.appendChild(scoreboardAvatar);
        scoreboardPlayerWrapper.appendChild(scoreboardName);
        scoreboardPlayerWrapper.appendChild(scoreboardScore);

        node.appendChild(scoreboardPlayerWrapper);

    });

}

function makeEndScoreboard(players) {
    const orderedPlayers = [];

    for (let i = 0; i < players.length; i++) {
        const currentPlayer = players[i];
        let inserted = false;

        if (!currentPlayer) return;

        // Loop over players to check if score is higher, if is higher add to that position
        for (let x = 0; x < orderedPlayers.length; x++) {
            const orderedPlayer = orderedPlayers[x];

            if (orderedPlayer.score < currentPlayer.score) {
                orderedPlayers.splice(x, 0, currentPlayer);
                inserted = true;
                break;
            }
        }

        // If not inserted already -> add to end of array (score is lower than inserted players)
        if (!inserted) {
            orderedPlayers.push(currentPlayer);
        }

    }

    gameEndScoreboardDOM.innerHTML = '';

    orderedPlayers.forEach(player => {

        // add players to scoreboard
        const scoreboardPlayerWrapper = document.createElement('div');
        scoreboardPlayerWrapper.classList.add('score-player');

        const scoreboardAvatar = document.createElement('div');
        scoreboardAvatar.classList.add('avatar');
        scoreboardAvatar.innerHTMl = 'Avatar';

        const scoreboardName = document.createElement('div');
        scoreboardName.classList.add('name');
        scoreboardName.innerHTML = player.username;

        const scoreboardScore = document.createElement('div');
        scoreboardScore.classList.add('score');
        if (!player.score) player.score = 0;
        scoreboardScore.innerHTML = player.score;

        const scoreboardScoreChange = document.createElement('div');
        scoreboardScoreChange.classList.add('score-change');
        if (!player.scoreChange) player.scoreChange = 0;
        scoreboardScoreChange.innerHTML = `+${player.scoreChange}`;
        player.scoreChange = 0;

        scoreboardScore.appendChild(scoreboardScoreChange);

        scoreboardPlayerWrapper.appendChild(scoreboardAvatar);
        scoreboardPlayerWrapper.appendChild(scoreboardName);
        scoreboardPlayerWrapper.appendChild(scoreboardScore);

        gameEndScoreboardDOM.appendChild(scoreboardPlayerWrapper);

    });

    gameEndWrapper.classList.remove('hide');

}

function fetchWords(wordsWrapper) {

    const xhr = new XMLHttpRequest();

    const body = `act=get`;

    xhr.open('POST', 'admin/php/words.php');

    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhr.send(body);

    xhr.onload = function () {
        if (xhr.status == 200) {
            const words = JSON.parse(xhr.response);
            const wordsAllDOM = wordsWrapper.getElementsByClassName('word');

            for (let i = 0; i < wordsAllDOM.length; i++) {
                const word = wordsAllDOM[i];

                word.innerHTML = words[i]['word'];
                word.dataset.word = words[i]['word'];

                word.classList = 'word';
                word.classList.add(words[i]['difficulty']);

            }

        }
    };

}
