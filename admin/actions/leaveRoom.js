const leavePlayingRoom  = document.getElementById('leavePlayingRoom');
const returnBtnDOM      = document.getElementsByClassName('return-btn');
const mainMenuDOM = document.getElementsByClassName('main-menu')[0];
const leaveRoomBtn = document.getElementsByClassName('lobby__close')[0];

// Add eventListener to button to leave the room
for (let i = 0; i < returnBtnDOM.length; i++) {
    const el = returnBtnDOM[i];

    el.addEventListener('click', toMainMenu);
}

// Leave Game room
leaveRoomBtn.addEventListener('click', leaveRoom);
leavePlayingRoom.addEventListener('click', leaveRoom);


// Someone is leaving the room
socket.on('someone left room', (leavingUser, room) => {

    audio = new Audio('assets/sound/leave.wav');
    audio.addEventListener("canplaythrough", event => {
        audio.play();
    });

    user.currentRoom = room;

    const adminIconHTML = `<div class="player__admin">
                                            <img src="assets/img/admin.svg" alt="Admin" class="player__admin--img">
                                    </div>`;

    const element = document.getElementById(leavingUser.username);

    // If the host leaves, pass host to new players
    // Host changed
    if (element.dataset.host === 'true') {
        const newHostElement = document.getElementById(room.host);
        newHostElement.dataset.host = 'true';
        newHostElement.insertAdjacentHTML('afterbegin', adminIconHTML);
    }

    if (user.username === room.host) {
        showHostElements();
        insertLobbySettings(room);
    }

    // Remove leaving user out of playerList
    element.parentNode.removeChild(element);

    notificate('info', `${leavingUser.username} has left the room.`);

});

// When someone leaves the room
socket.on('someone left playingroom', (leavingUser, room) => {

    user.playingRoom.players = [...room.players];
    user.playingRoom.playerCount -= 1;
    user.playingRoom.playerNames = [...room.playerNames];
    user.playingRoom.drawQueue = [...room.drawQueue];

    // TODO:: Admin HTML in game
    const element = document.getElementById(`player-${leavingUser.username}`);
    element.parentNode.removeChild(element);

});

function leaveRoom(e) {
    // Get joined room
    const roomToLeave = user.currentRoom.name

    // Leave room
    socket.emit('leave room', roomToLeave, user);

    // Clear chat
    lobbyChat.innerHTML = '';

    socket.on('left room', userData => {
        user.joinedRoom = false;
    });

    socket.on('lobby to home', () => {
        clearTimer(roundTimer);
        delete user.currentRoom;
        lobbyDOM.classList.add('hide');
        gameBrowse.classList.remove('hide');
    });

    socket.on('playingroom to home', () => {
        delete user.playingRoom;

        gameWrapper.classList.add('hide');
        gameBrowse.classList.remove('hide');
    });
    
    user.joinedRoom = false;

    // If user is in playingRoom, leave playingRoom
    if (!user.playingRoom) return;

    // Leave playingRoom
    socket.emit('leave playingroom', user.playingRoom.name, user);

    hideGameElements();
}

// Return to main menu
function toMainMenu(e) {
    const source = e.target.closest('.sub-menu');

    mainMenuDOM.classList.remove('hide');
    source.classList.add('hide');
}

// Clear the html so it was on initial state
function clearHTMLOnLeave() {
    const username = user.username;

    // TODO:: Clear score and success line to normal line
    document.getElementById(`score-${username}`).innerHTML = '';
}

function hideGameElements() {
    // Hide all GameRoomOverlays
    choosingWordDOM.classList.add('hide');
    playerChoosingDOM.classList.add('hide');
    scoreOverlayDOM.classList.add('hide');
}