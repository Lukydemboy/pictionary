socket.on('you have been kicked', () => {
    lobbyDOM.classList.add('hide');
    gameBrowse.classList.remove('hide');

    notificate('info', `You have been kicked from the room`);
});

socket.on('someone is kicked', (leavingUser, room) => {
    const element = document.getElementById(leavingUser.username);

    // Remove leaving user out of playerList
    element.parentNode.removeChild(element);

    notificate('info', `${leavingUser.username} is kicked.`);
});

function kickPlayer(event) {
    const source = event.target.closest('.player'),
        playerUsername = source.id,
        room = user.currentRoom.name;

    let socketID;
    // Get socketId from users
    const users = user.currentRoom.players;

    for (let i = 0; i < users.length; i++) {
        const currentUser = users[i];

        socketID = currentUser.socketId;
    }

    socket.emit('kick player', playerUsername, socketID, room);

}
