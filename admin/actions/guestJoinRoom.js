
if (user && user.userType === 'guest' && user.roomToJoin !== '') {
    socket.emit('join room', user.roomToJoin, user);
}