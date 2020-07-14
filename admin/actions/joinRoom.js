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
    joinRoom(room);
});

socket.on('already joined', () => {
    notificate('warning', `You've already joined this room`);
});

socket.on('room full', () => {
    notificate('warning', `Room is full`);
});

// When room is joined
socket.on('joined room', joinedRoom => {
    // Make and add lobby URL to copyButton
    inviteURL = window.location.href.split('?')[0];
    copyURLDOM.dataset.url = `${inviteURL}?action=joinRoom&room=${joinedRoom.name}`;

    user.joinedRoom = true;
    // Set user room to joinedRoom object
    user.currentRoom = joinedRoom;
    // hide settings in the lobby
    lobbySettingsDOM.classList.add('hide');
});

// When joined a room when it is already playing
socket.on('joined playingroom', joinedRoom => {
    user.playingRoom = joinedRoom;

    console.log('Joining playingroom...');
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

        // PLAYER POP UP
        const playerPopup = document.createElement('div');
        playerPopup.classList.add('player__popup');
        playerPopup.classList.add('hide');

        const playerPopupClose = document.createElement('div');
        playerPopupClose.classList.add('player__popup--close');
        const closeImage = document.createElement('img');
        closeImage.classList.add('close__btn');
        closeImage.src = 'assets/img/closebutton.svg';

        popupActionBar = `
                            <div class="popup__action-bar">
                                <div data-username="${player.username}" data-userid="${player.userID}" class="action add-friend">
                                    <img src="assets/img/add-friend.svg" alt="Add Friend">
                                </div>
                            </div>
                         `

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

        playerPopup.insertAdjacentHTML('beforeend', popupActionBar);

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

    // Add friend
    const addFriendDOM = document.getElementsByClassName('add-friend');

    for (let i = 0; i < addFriendDOM.length; i++) {
        const addFriendBtn = addFriendDOM[i];

        addFriendBtn.addEventListener('click', addFriend);
    }

});

socket.on('room not found', () => {
    notificate('warning', `The room you were trying to join doesn't exist`)
});

function joinRoom(roomName) {

    sessionStorage.setItem('currentRoom', roomName);

    leaveRoomBtn.dataset.room = roomName;

    gameBrowse.classList.add('hide');
    lobbyDOM.classList.remove('hide');

    mainMenuDOM.classList.remove('hide');
    joinRoomDOM.classList.add('hide');

    hideHostElements();

}

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

}

function closePopups() {
    // hide all popups before showing another one
    const popupDOMALL = document.getElementsByClassName('player__popup');

    for (let i = 0; i < popupDOMALL.length; i++) {
        const currentPopup = popupDOMALL[i];

        currentPopup.classList.add('hide');
    }
}

// Add friend to friendlist
function addFriend(e) {
    const source = e.target.closest('.action');

    const friendUserID = source.dataset.userid;
    const username = source.dataset.username;

    if (friendUserID == user.userID) return;

    const xhr = new XMLHttpRequest();

    const body = `friendUserID=${friendUserID}&username=${username}&act=add`;

    xhr.open('POST', 'admin/php/friends.php', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhr.send(body);

    xhr.onload = () => {
        if (xhr.status == 200) {
            const data = xhr.response;
            
            if (data === 'success') {
                socket.emit('friend request sent', username);
                notificate('success', 'Friend request is sent!');
            }
        }
    };    

}

