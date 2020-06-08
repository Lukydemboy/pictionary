console.log('Tis dien ier godverdomme');
const socket = io();
const startGame = document.getElementById('startGame');

const cavasDOM = document.getElementsByClassName('pictionary_canvas')[0];
const createRoomDOM = document.getElementById('createRoom');
const roomNameDOM   = document.getElementById('roomName');
const roomSizeDOM   = document.getElementById('roomSize');
const getRoomsDOM   = document.getElementById('getRooms');
const roomsListDOM  = document.getElementsByClassName('rooms-list')[0];

startGame.addEventListener('click', e => {
    e.preventDefault();
    console.log('clicked');

    socket.emit('start game', params);
    socket.on('start game', console.log('Started'));

});

// Make room
createRoomDOM.addEventListener('click', e => {
    const room = {
        name: roomNameDOM.value ? roomNameDOM.value : `Username's room`,
        size: roomSizeDOM.value ? roomSizeDOM.value : 16,
        host: 'username',
        type: 'open'
    }
    console.log('Creating Room...', room.name);
    socket.emit('create room', room);
});

socket.on('create room', room => {
    console.log(`Room made: ${room}`);
    sessionStorage.setItem('currentRoom', room.name);
    console.log(sessionStorage.getItem('currentRoom'));
})

getRoomsDOM.addEventListener('click', e => {
    socket.emit('get rooms');
});

// Create table with all rooms
socket.on('get rooms', allRooms => {

    roomsListDOM.innerHTML = '';

    // Create Room List
    for (let i = 0; i < allRooms.length; i++) {
        const currentRoom = allRooms[i];

        const row = document.createElement('tr');
        row.classList.add('room-list__item');

        const name = document.createElement('td');
        name.innerHTML = currentRoom.name;

        const creator = document.createElement('td');
        creator.innerHTML = currentRoom.host;

        const size = document.createElement('td');
        size.innerHTML = `${currentRoom.players}/${currentRoom.size}`;
        
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

        roomsListDOM.appendChild(row);
    }

    // Add eventlisteners to newly generated buttons
    const joinButtons = document.getElementsByClassName('join-button');

    for (let i = 0; i < joinButtons.length; i++) {
        const joinButton = joinButtons[i];

        joinButton.addEventListener('click', e => {
            console.log(`Joining room...`);
            socket.emit('join room', joinButton.dataset.roomId);

            socket.on('join room', room => {
                console.log(`Joined room ${room}`);
                sessionStorage.setItem('currentRoom', room);
                console.log(sessionStorage.getItem('currentRoom'));
            });
        });
    }

    console.log(allRooms);

})

