const gameBrowse  = document.getElementById('gameBrowse');
const joinRoomDOM = document.getElementById('joinRoom');

const lobbyNameDOM = document.getElementById('lobbySettingsRoomName');
const lobbyPlayersDOM = document.getElementById('lobbySettingsRoomPlayers');
const lobbyRoundsDOM = document.getElementById('lobbySettingsRounds');
const lobbyTimeDOM = document.getElementById('lobbySettingsDrawTime');
const lobbyTypeDOM = document.getElementById('lobbySettingsType');



// Create table with all rooms
socket.on('get rooms', allRooms => {
    roomListDOM.innerHTML = '';

    // Create Room List
    for (let i = 0; i < allRooms.length; i++) {
        const currentRoom = allRooms[i];

        if (currentRoom.type != 'private') {
            const row = document.createElement('tr');
            row.classList.add('room-list__item');

            const name = document.createElement('td');
            name.innerHTML = currentRoom.name;

            const creator = document.createElement('td');
            creator.innerHTML = currentRoom.host;


            const size = document.createElement('td');
            size.innerHTML = `${currentRoom.playerCount}/${currentRoom.size}`;

            const type = document.createElement('td');
            type.innerHTML = currentRoom.type;

            // Create join button
            const join = document.createElement('td');
            const button = document.createElement('button');
            button.dataset.roomId = currentRoom.name;
            button.innerHTML = 'Join';
            button.classList.add('join-button');
            join.appendChild(button);

            row.appendChild(name);
            row.appendChild(creator);
            row.appendChild(size);
            row.appendChild(type);
            row.appendChild(join);

            roomListDOM.appendChild(row);

        }

    }

    // Add eventlisteners to newly generated buttons
    const joinButtons = document.getElementsByClassName('join-button');

    for (let i = 0; i < joinButtons.length; i++) {
        const joinButton = joinButtons[i];

        joinButton.addEventListener('click', e => {

            socket.emit('join room', joinButton.dataset.roomId, user);

        });
    }

});


// Join room
socket.on('join room', room => {
    sessionStorage.setItem('currentRoom', room);

    leaveRoomBtn.dataset.room = room;

    gameBrowse.classList.add('hide');
    lobbyDOM.classList.remove('hide');

    mainMenuDOM.classList.remove('hide');
    joinRoomDOM.classList.add('hide');

    hideHostElements();

});

socket.on('already joined', () => {
    notificate('warning', `You've already joined this room`);
});

socket.on('room full', () => {
    notificate('warning', `Room is full`);
});

// When room is joined
socket.on('joined room', joinedRoom => {
    user.joinedRoom = true;
    // Set user room to joinedRoom object
    user.currentRoom = joinedRoom;
    // hide settings in the lobby
    lobbySettingsDOM.classList.add('hide');
});

// When joined a room when it is already playing
socket.on('joined playingroom', joinedRoom => {
    user.playingRoom = joinedRoom;

    console.log('Joining playingroom....');
    gameBrowse.classList.add('hide');
    gameWrapper.classList.remove('hide');

    user.joinedRoom = true;

    // Set user room to joinedRoom object
    user.currentRoom = joinedRoom;

    // hide settings in the lobby
    lobbySettingsDOM.classList.add('hide');
});

// Someone else joined the playingRoom (the room has to be updated)
socket.on('someone joined playingroom', room => {
    user.playingRoom = room;

    // Update playerList
    createPlayerList();

    console.log('Pushing room to all players in room');
    console.log(user.playingRoom);
});

// Room JS
socket.on('player joined', (changedRoom, joinedUser) => {
    notificate('info', `${joinedUser.username} has just joined the room!`);

    // Play sound when someone joins the room
    audio = new Audio('assets/sound/join.wav');
    audio.addEventListener("canplaythrough", event => {
        audio.play();
    });


    const players = changedRoom.players;

    const playersListUL = document.createElement('ul');

    lobbyPlayerList.innerHTML = '';

    const updatedPlayerNames = [];
    const updatedPlayers = [];
    let playercount = 0;

    for (let i = 0; i < players.length; i++) {
        const player = players[i];

        const adminIconHTML = `<div class="player__admin">
                                            <img src="assets/img/admin.svg" alt="Admin" class="player__admin--img">
                                        </div>`;

        const kickPlayerHTML = `
                                            <div class="player__kick hide">
                                                <img src="assets/img/kick.svg" alt="Kick Player" class="player--kick">
                                            </div>
                                       `;

        const playerLI = document.createElement('li');
        playerLI.classList.add('player');
        playerLI.id = player.username;

        if (player.username === changedRoom.host) {
            playerLI.insertAdjacentHTML('beforeend', adminIconHTML);
            playerLI.dataset.host = 'true';
        } else {
            playerLI.insertAdjacentHTML('beforeend', kickPlayerHTML);
            playerLI.dataset.host = 'true';
        }

        // POP UP
        const playerPopup = document.createElement('div');
        playerPopup.classList.add('player__popup');
        playerPopup.classList.add('hide');

        const playerPopupClose = document.createElement('div');
        playerPopupClose.classList.add('player__popup--close');
        const closeImage = document.createElement('img');
        closeImage.classList.add('close__btn');
        closeImage.src = 'assets/img/closebutton.svg';

        popupContent = `
                                <div class="popup__content">
                                    <div class="popup__username">
                                        ${player.username}
                                    </div>
                                    <div class="popup__level">
                                        ${player.level}
                                    </div>
                                    <div class="popup__country">
                                        ${player.country}
                                    </div>
                                </div>
                               `;

        playerPopupClose.appendChild(closeImage);
        playerPopup.appendChild(playerPopupClose);
        playerPopup.insertAdjacentHTML('beforeend', popupContent);

        // PLAYER INFO
        const playerWrapper = document.createElement('div');
        playerWrapper.classList.add('player__wrapper');

        const playerName = document.createElement('p');
        playerName.innerHTML = player.username;
        playerName.classList.add('player-name');

        const playerLevel = document.createElement('p');
        playerLevel.innerHTML = player.level;
        playerLevel.classList.add('player-level');

        const playerCountry = document.createElement('p');
        playerCountry.innerHTML = player.country;
        playerCountry.classList.add('player-country');

        playerWrapper.appendChild(playerName);
        playerWrapper.appendChild(playerLevel);
        playerWrapper.appendChild(playerCountry);

        playerLI.appendChild(playerPopup);
        playerLI.appendChild(playerWrapper);
        playersListUL.append(playerLI);

        lobbyPlayerList.appendChild(playersListUL);

        updatedPlayerNames.push(player.username);
        updatedPlayers.push(player);
        playercount = i + 1;
    }

    user.currentRoom = changedRoom;

    user.currentRoom.playerNames = [...updatedPlayerNames];
    user.currentRoom.players = [...updatedPlayers];
    user.currentRoom.playerCount = playercount;


    // Open Player popup
    const allPlayersDOM = document.getElementsByClassName('player__wrapper');

    for (let i = 0; i < allPlayersDOM.length; i++) {
        const currentPlayer = allPlayersDOM[i];

        currentPlayer.addEventListener('click', popupProfile);
    }


    // Close Player popup
    const popupClose = document.getElementsByClassName('player__popup--close');

    for (let i = 0; i < popupClose.length; i++) {
        const currentPopupClose = popupClose[i];

        currentPopupClose.addEventListener('click', closePopups);
    }

    // Kick Player
    const kickPlayerDOM = document.getElementsByClassName('player__kick');

    for (let i = 0; i < kickPlayerDOM.length; i++) {
        const kickPlayerBtn = kickPlayerDOM[i];
        if (user.username === user.currentRoom.host) {
            kickPlayerBtn.classList.remove('hide');
        }

        kickPlayerBtn.addEventListener('click', kickPlayer);
    }

});

function hideHostElements() {
    lobbySettingsBtn.classList.add('hide');
    lobbySettingsDOM.classList.add('hide');
    startGameBtn.classList.add('hide');
}

function insertLobbySettings(room) {
    lobbyNameDOM.value = room.name;
    lobbyPlayersDOM.value = room.size;
    lobbyRoundsDOM.value = room.rounds;
    lobbyTimeDOM.value = room.drawTime;
    lobbyTypeDOM.checked = roomType.checked;
}


function popupProfile(event) {
    // Get player name
    const source = event.target.closest('.player');
    const playerName = source.id;

    const popupDOM = source.getElementsByClassName('player__popup')[0];

    // Hide all Popups before opening another one
    closePopups();

    popupDOM.classList.remove('hide');

    // Get player info from DB 
    const xhr = new XMLHttpRequest();

    xhr.open('POST', 'admin/php/getPlayer.php', true);

    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            console.log(JSON.parse(xhr.response));
        }
    }

    xhr.send(`playerName=${playerName}`);


}

function closePopups() {
    // hide all popups before showing another one
    const popupDOMALL = document.getElementsByClassName('player__popup');

    for (let i = 0; i < popupDOMALL.length; i++) {
        const currentPopup = popupDOMALL[i];

        currentPopup.classList.add('hide');
    }
}