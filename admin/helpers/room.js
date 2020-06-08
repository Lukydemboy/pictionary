document.addEventListener('DOMContentLoaded', e => {

    const startDrawDOM = document.getElementsByClassName('game-browse__content--room-choice')[0];
    const createRoomDOM = document.getElementsByClassName('create_room')[0];
    const joinRoomDOM = document.getElementsByClassName('join_room')[0];
    const getRoomsDOM = document.getElementById('getRooms');
    const roomButtonsAll = document.getElementsByClassName('game-browse__content--tile');


    // Create room
    for (let i = 0; i < roomButtonsAll.length; i++) {
        const roomButton = roomButtonsAll[i];

        roomButton.addEventListener('click', handleClick);
    }

    // Get all rooms
    getRoomsDOM.addEventListener('click', e => {
        socket.emit('get rooms');
    });

    // Reload Room List
    reloadRoomList.addEventListener('click', () => {
        socket.emit('get rooms');
    });



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

