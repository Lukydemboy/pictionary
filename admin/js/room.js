document.addEventListener('DOMContentLoaded', e => {

    const startDrawDOM      = document.getElementsByClassName('game-browse__content--room-choice')[0];
    const mainMenuDOM       = document.getElementsByClassName('main-menu')[0];
    const createRoomDOM     = document.getElementsByClassName('create_room')[0];
    const joinRoomDOM       = document.getElementsByClassName('join_room')[0];
    const returnBtnDOM      = document.getElementsByClassName('return-btn');
    const leaveRoomBtn      = document.getElementsByClassName('lobby__close')[0];



    // Get all rooms
    getRoomsDOM.addEventListener('click', e => {
        socket.emit('get rooms');
    });

    // Reload Room List
    reloadRoomList.addEventListener('click', () => {
        socket.emit('get rooms');
    });


    
    
    leaveRoomBtn.addEventListener('click', leaveRoom);
    

    function handleClick(e) {
        const roomButton = e.target.closest('.game-browse__content--tile');
        const action = roomButton.dataset.action.split('-')[0];

        switch (action) {

            case 'create':
                startDrawDOM.classList.add('hide');
                createRoomDOM.classList.remove('hide');

                break;

            case 'join':
                startDrawDOM.classList.add('hide');
                joinRoomDOM.classList.remove('hide');

                break;

        }

    }

});

//

// document.addEventListener('DOMContentLoaded', e => {

//     const roomButtonsAll    = document.getElementsByClassName('game-browse__content--tile');
//     const startDrawDOM      = document.getElementsByClassName('game-browse__content--room-choice')[0];
//     const mainMenuDOM       = document.getElementsByClassName('main-menu')[0];
//     const createRoomDOM     = document.getElementsByClassName('create_room')[0];
//     const joinRoomDOM       = document.getElementsByClassName('join_room')[0];
//     const leaveRoomBtn      = document.getElementsByClassName('lobby__close')[0];
//     const leavePlayingRoom  = document.getElementById('leavePlayingRoom');

//     const gameBrowse    = document.getElementById('gameBrowse');
//     const lobbyDOM      = document.getElementById('lobby');
//     const lobbyChat     = document.getElementById('lobbyChatMessages');



//     // Get all rooms
//     getRoomsDOM.addEventListener('click', e => {
//         socket.emit('get rooms');
//     });

//     // Reload Room List
//     reloadRoomList.addEventListener('click', () => {
//         socket.emit('get rooms');
//     });

//     // Create room
//     for (let i = 0; i < roomButtonsAll.length; i++) {
//         const roomButton = roomButtonsAll[i];

//         roomButton.addEventListener('click', handleClick);
//     }

//     // Make room
//     createRoomBtn.addEventListener('click', e => {
//         e.preventDefault();

//         const room = {
//             name: roomNameDOM.value ? roomNameDOM.value : roomNameDOM.placeholder,
//             size: roomSizeDOM.value ? roomSizeDOM.value : 12,
//             rounds: roomRoundsDOM.value ? roomRoundsDOM.value : roomSizeDOM.placeholder,
//             drawTime: roomDrawTimeDOM.value ? roomDrawTimeDOM.value : roomDrawTimeDOM.placeholder,
//             host: user.username,
//             type: roomType.checked ? 'private' : 'public',
//             playerNames: [user.username],
//             players: [user],
//             playerCount: 0
//         }

//         socket.emit('create room', room);

//     });

//     // When room is created
//     socket.on('room created', room => {

//         sessionStorage.setItem('currentRoom', room.name);

//         // Insert Lobby Settings
//         insertLobbySettings(room);

//         const playerHTML = `
//                         <li id="${user.username}" class="player">
//                             <div class="player__admin">
//                                 <img src="assets/img/admin.svg" alt="Admin" class="player__admin--img">
//                             </div>
//                             <div class="player__wrapper">
//                                 <p class="player-name">${user.username}</p>
//                                 <p class="player-level">${user.level}</p>
//                                 <p class="player-country">${user.country}</p>
//                             </div>
//                         </li>
//                         `;

//         // Put host in playerlist
//         lobbyPlayerList.innerHTML = playerHTML;

//         leaveRoomBtn.dataset.room = room.name;

//         // Set user state to joined
//         user.joinedRoom = true;
//         user.currentRoom = room;

//         // Show lobby and hide gamebrowse section
//         gameBrowse.classList.add('hide');
//         lobbyDOM.classList.remove('hide');

//         // Go back to main menu
//         mainMenuDOM.classList.remove('hide');
//         createRoomDOM.classList.add('hide');

//         showHostElements();

//         notificate('success', 'The room has successfully been created!');

//     });


//     leaveRoomBtn.addEventListener('click', leaveRoom);

//     // Leave Game room
//     leavePlayingRoom.addEventListener('click', leaveRoom);


//     // Join room
//     socket.on('join room', room => {
//         sessionStorage.setItem('currentRoom', room);

//         leaveRoomBtn.dataset.room = room;

//         gameBrowse.classList.add('hide');
//         lobbyDOM.classList.remove('hide');

//         mainMenuDOM.classList.remove('hide');
//         joinRoomDOM.classList.add('hide');

//     });

//     // When room is joined
//     socket.on('joined room', joinedRoom => {
//         user.joinedRoom = true;
//         // Set user room to joinedRoom object
//         user.currentRoom = joinedRoom;
//         // hide settings in the lobby
//         lobbySettingsDOM.classList.add('hide');
//     });

//     // When joined a room when it is already playing
//     socket.on('joined playingroom', joinedRoom => {
//         user.playingRoom = joinedRoom;

//         console.log('Joining playingroom....');
//         gameBrowse.classList.add('hide');
//         gameWrapper.classList.remove('hide');

//         user.joinedRoom = true;

//         // Set user room to joinedRoom object
//         user.currentRoom = joinedRoom;

//         // hide settings in the lobby
//         lobbySettingsDOM.classList.add('hide');
//     });

//     // Someone else joined the playingRoom (the room has to be updated)
//     socket.on('someone joined playingroom', room => {
//         user.playingRoom = room;

//         // Update playerList
//         createPlayerList();

//         console.log('Pushing room to all players in room');
//         console.log(user.playingRoom);
//     });

//     // Someone is leaving the room
//     socket.on('someone left room', (leavingUser, room) => {

//         audio = new Audio('assets/sound/leave.wav');
//         audio.addEventListener("canplaythrough", event => {
//             audio.play();
//         });

//         user.currentRoom = room;

//         const adminIconHTML = `<div class="player__admin">
//                                             <img src="assets/img/admin.svg" alt="Admin" class="player__admin--img">
//                                     </div>`;

//         const element = document.getElementById(leavingUser.username);

//         // If the host leaves, pass host to new players
//         // Host changed
//         if (element.dataset.host === 'true') {
//             const newHostElement = document.getElementById(room.host);
//             newHostElement.dataset.host = 'true';
//             newHostElement.insertAdjacentHTML('afterbegin', adminIconHTML);
//         }

//         if (user.username === room.host) {
//             showHostElements();
//             insertLobbySettings(room);
//         }

//         // Remove leaving user out of playerList
//         element.parentNode.removeChild(element);

//         notificate('info', `${leavingUser.username} has left the room.`);

//     });

//     socket.on('someone left playingroom', (leavingUser, room) => {
//         console.log('Someone left playingRoom... Setting playingRoom to new room');
//         console.log(room);

//         user.playingRoom.players = [...room.players];
//         user.playingRoom.playerCount -= 1;
//         user.playingRoom.playerNames = [...room.playerNames];
//         user.playingRoom.drawQueue = [...room.drawQueue];

//         // TODO:: Admin HTML in game
//         const element = document.getElementById(`player-${leavingUser.username}`);
//         element.parentNode.removeChild(element);

//     });

//     function handleClick(e) {
//         const roomButton = e.target.closest('.game-browse__content--tile');
//         const action = roomButton.dataset.action.split('-')[0];

//         switch (action) {

//             case 'create':
//                 startDrawDOM.classList.add('hide');
//                 createRoomDOM.classList.remove('hide');

//                 break;

//             case 'join':
//                 startDrawDOM.classList.add('hide');
//                 joinRoomDOM.classList.remove('hide');

//                 break;

//         }

//     }

//     function toMainMenu(e) {
//         const source = e.target.closest('.sub-menu');

//         mainMenuDOM.classList.remove('hide');
//         source.classList.add('hide');
//     }

//     function leaveRoom(e) {
//         // Get joined room
//         const roomToLeave = user.currentRoom.name

//         // Leave room
//         socket.emit('leave room', roomToLeave, user);

//         // Clear chat
//         lobbyChat.innerHTML = '';

//         socket.on('left room', userData => {
//             user.joinedRoom = false;
//         });

//         socket.on('lobby to home', () => {
//             clearTimer(roundTimer);
//             delete user.currentRoom;
//             lobbyDOM.classList.add('hide');
//             gameBrowse.classList.remove('hide');
//         });

//         socket.on('playingroom to home', () => {
//             delete user.playingRoom;

//             gameWrapper.classList.add('hide');
//             gameBrowse.classList.remove('hide');
//         });

//         // If user is in playingRoom, leave playingRoom
//         if (!user.playingRoom) return;

//         console.log('LEAVING PLAYINGROOM....');
//         // Leave playingRoom
//         socket.emit('leave playingroom', user.playingRoom.name, user);

//         user.joinedRoom = false;

//     }

//     function clearHTMLOnLeave() {
//         const username = user.username;

//         // TODO:: Clear score and success line to normal line
//         document.getElementById(`score-${username}`).innerHTML = '';
//     }




// });


