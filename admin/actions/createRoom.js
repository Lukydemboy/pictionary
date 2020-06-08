const createRoomDOM = document.getElementById('createRoom');
const createRoomBtn = document.getElementById('createRoomBtn');
const lobbyDOM = document.getElementById('lobby');

const lobbySettingsDOM = document.getElementById('lobbySettings');
const roomType = document.getElementById('private-room');
const roomNameDOM = document.getElementById('roomName');
const roomSizeDOM = document.getElementById('roomSize');
const roomRoundsDOM = document.getElementById('roomRounds');
const roomDrawTimeDOM = document.getElementById('roomTime');
const roomListDOM = document.getElementById('roomList');
const reloadRoomList = document.getElementById('reloadRoomList');
const lobbyPlayerList = document.getElementById('lobbyPlayers');

const startGameBtn = document.getElementById('startGameBtn');



// Make room
createRoomBtn.addEventListener('click', e => {
    e.preventDefault();

    const room = {
        name: roomNameDOM.value ? roomNameDOM.value : roomNameDOM.placeholder,
        size: roomSizeDOM.value ? roomSizeDOM.value : 12,
        rounds: roomRoundsDOM.value ? roomRoundsDOM.value : roomSizeDOM.placeholder,
        drawTime: roomDrawTimeDOM.value ? roomDrawTimeDOM.value : roomDrawTimeDOM.placeholder,
        host: user.username,
        type: roomType.checked ? 'private' : 'public',
        playerNames: [user.username],
        players: [user],
        playerCount: 0
    }

    socket.emit('create room', room);

});

// When room is created
socket.on('room created', room => {

    sessionStorage.setItem('currentRoom', room.name);

    // Insert Lobby Settings
    insertLobbySettings(room);

    const playerHTML = `
                        <li id="${user.username}" class="player">
                            <div class="player__admin">
                                <img src="assets/img/admin.svg" alt="Admin" class="player__admin--img">
                            </div>
                            <div class="player__wrapper">
                                <p class="player-name">${user.username}</p>
                                <p class="player-level">${user.level}</p>
                                <p class="player-country">${user.country}</p>
                            </div>
                        </li>
                        `;

    // Put host in playerlist
    lobbyPlayerList.innerHTML = playerHTML;

    leaveRoomBtn.dataset.room = room.name;

    // Set user state to joined
    user.joinedRoom = true;
    user.currentRoom = room;

    // Show lobby and hide gamebrowse section
    gameBrowse.classList.add('hide');
    lobbyDOM.classList.remove('hide');

    // Go back to main menu
    mainMenuDOM.classList.remove('hide');
    createRoomDOM.classList.add('hide');

    showHostElements();

    notificate('success', 'The room has successfully been created!');

});


function showHostElements() {
    // Show or hide room settings
    lobbySettingsBtn.classList.remove('hide');
    lobbySettingsDOM.classList.remove('hide');

    // Show startGameBtn
    startGameBtn.classList.remove('hide');
}
