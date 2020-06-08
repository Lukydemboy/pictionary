// Lobby
const changeRoomBtnDOM = document.getElementById('changeRoomBtn');

// Modal
const lobbySettingsModal = document.getElementById('settingsModal');
const lobbySettingsBtn = document.getElementById('lobbySettingsBtn');
const closeSettingsModal = document.getElementsByClassName('settings__close')[0];

// Modal button for lobby Settings
lobbySettingsBtn.addEventListener('click', () => {
    lobbySettingsModal.classList.remove('hide');
});

// Close button for lobby Settings
closeSettingsModal.addEventListener('click', () => {
    lobbySettingsModal.classList.add('hide');
});


// When click on 'Change Room' 
changeRoomBtn.addEventListener('click', e => {
    e.preventDefault();

    const lobby = {
        name: lobbyNameDOM.value,
        host: user.currentRoom.host,
        size: lobbyPlayersDOM.value,
        type: lobbyTypeDOM.checked ? 'private' : 'public',
        rounds: lobbyRoundsDOM.value,
        drawTime: lobbyTimeDOM.value
    }

    socket.emit('change room', lobby, user);

    socket.on('room changed', (changedRoom) => {
        user.currentRoom = changedRoom;
        lobbySettingsModal.classList.add('hide');
        notificate('success', 'Room has been changed.');
    });

});

