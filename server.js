const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const express = require('express');
const path = require('path');
const port = process.env.PORT || 3000;

const roomObjects = [];
const playingRoomObjects = [];
const connectedUsers = [];

app.use(express.static(path.join(__dirname, '/public')));

app.get("/", function(req, res) {
  res.sendFile(__dirname + '/game.html');
});

io.on("connection", function(socket) {

  io.emit('user has come online');

  connectedUsers[socket.id] = { socketId: socket.id, username: socket.handshake.query.username };

  socket.emit('connected');

  socket.on('disconnect', () => {
    // leave the room the user is in (on page leave)
    if (connectedUsers[socket.id].currentRoom) {
      const room = connectedUsers[socket.id].currentRoom;
      const username = connectedUsers[socket.id].username;

      if (!roomObjects[room]) return;
      if (!roomObjects[room].players) return;

      if (roomObjects[room].players.length >= 2) {

        for (let i = 0; i < roomObjects[room].players.length; i++) {
          const player = roomObjects[room].players[i];

          leavingUser = player;

          if (player.username === username) {
            roomObjects[room].players.splice(i, 1);
            roomObjects[room].playerCount -= 1;
            roomObjects[room].playerNames.splice(roomObjects[room].playerNames.indexOf(username), 1);

            delete connectedUsers[socket.id].currentRoom;

            // Set new host when host leaves
            if (player.username === roomObjects[room].host) {
              roomObjects[room].host = roomObjects[room].players[0].username;
            }

            break;
          }
        }

        socket.to(room).emit('someone left room', leavingUser, roomObjects[room]);

      } else {
        // Delete room from roomObjects (when there are no users in the room)
        delete roomObjects[room];
      }

    }

    // Delete user out of connected users
    // TODO:: find better way to delete user out of array (same for deleting room);
    delete connectedUsers[socket.id];

    console.log('User is disconnecting');
    socket.emit('user disconnected');
    io.emit('user has gone offline');
  });

  // Create room
  socket.on("create room", room => {

    // If room exists, nummer achter plaatsen
    let i = 1;
    let changingName = room.name
    while (changingName in roomObjects) {
      changingName = `${room.name}${i}`;
      i += 1;
    }

    if (i > 1) {
      room.name = `${room.name}${i}`;
    }

    // Create room
    socket.join(room.name);
    room.playerCount = 1;

    // Add to arrays
    roomObjects[room.name] = room;
    connectedUsers[socket.id].currentRoom = room.name;

    socket.emit('room created', room);

    console.log(`Room ${room.name} created!`);

  });

  // Get rooms (room list)
  socket.on('get rooms', () => {
    // We need to make an array of the object with objects bc socket.io does not pass the object
    const roomsArray = Object.keys(roomObjects).map(key => {
      return roomObjects[key];
    });
    
    socket.emit('get rooms', roomsArray);
  });

  // Join room
  socket.on('join room', (room, user) => {
    console.log(`${user.username} joining ${room}...`);

    if(!room) return;

    if (!roomObjects[room]) {
      socket.emit('room not found', room);
      return;
    };

    // Check if user already joined the room
    if (roomObjects[room].playerNames.includes(user.username)) {
      socket.emit('already joined');
      return;
    }

    if (roomObjects[room].size <= roomObjects[room].playerCount) {
      socket.emit('room full');
      return;
    }

    // Add players to player Arrays
    roomObjects[room].players.push(user);
    roomObjects[room].playerNames.push(user.username); connectedUsers[socket.id].currentRoom = room;

    // Get player count
    room.playerCount, roomObjects[room].playerCount = roomObjects[room].players.length;
   
    // Join de room en stuur 'join room' event naar de client.
    socket.join(room);
    socket.emit('joined room', roomObjects[room]);

    if (!playingRoomObjects[room]) {
      socket.emit('join room', room);
    } else {

      playingRoomObjects[room].players.push(user);
      playingRoomObjects[room].playerNames.push(user.username);

      socket.emit('joined playingroom', playingRoomObjects[room]);
      socket.to(room).emit('someone joined playingroom', playingRoomObjects[room]);
      
    }

    io.in(roomObjects[room].name).emit('player joined', roomObjects[room], user);

    console.log(`${user.username} has joined ${room}`);
    
  });

  // Leave room
  socket.on('leave room', (room, user) => {
    console.log(`${user.username} is leaving ${room}`);

    if (!roomObjects[room]) return;

    try {
      let leavingUser;
      // Delete user out of room
      if (roomObjects[room].players.length >= 2) {
        for (let i = 0; i < roomObjects[room].players.length; i++) {
          const player = roomObjects[room].players[i];

          leavingUser = player;

          if (player.username === user.username) {
            roomObjects[room].players.splice(i, 1);
            roomObjects[room].playerCount -= 1;
            roomObjects[room].playerNames.splice(roomObjects[room].playerNames.indexOf(user.username), 1);
            delete connectedUsers[socket.id].currentRoom;

            // Set new host when host leaves
            if (player.username === roomObjects[room].host) {
              roomObjects[room].host = roomObjects[room].players[0].username;
            }

            break;
          }

        }

      } else {
        // Delete room from roomObjects (when there are no users in the room)
        delete roomObjects[room];
      }

      socket.to(room).emit('someone left room', leavingUser, roomObjects[room]);
      socket.emit('lobby to home');
      socket.leave(room);

    } catch (error) {
      console.log(error);
      socket.emit('error', 'Could not leave the room');
    }
    

  });

  // Leave playingRoom
  socket.on('leave playingroom', (room, user) => {
    if (!playingRoomObjects[room]) return;

    let leavingUser;

    try {

      if (playingRoomObjects[room].players.length >= 2) {
        for (let i = 0; i < playingRoomObjects[room].players.length; i++) {
          const player = playingRoomObjects[room].players[i];

          leavingUser = player;

          if (player.username === user.username) {
            playingRoomObjects[room].players.splice(i, 1);
            playingRoomObjects[room].playerCount -= 1;
            playingRoomObjects[room].playerNames.splice(playingRoomObjects[room].playerNames.indexOf(user.username), 1);
            playingRoomObjects[room].drawQueue.splice(playingRoomObjects[room].playerNames.indexOf(user.username), 1);
            // delete connectedUsers[socket.id].playingRoom;

            break;

          }

        }

        socket.to(room).emit('someone left playingroom', leavingUser, playingRoomObjects[room]);

      } else {
        delete playingRoomObjects[room];
      }

      console.log('emitting playingroom to home...');
      socket.emit('playingroom to home');
    } catch (error) {
      console.log(error);
      socket.emit('error', 'Could not leave the room');
    }

  });

  // Friend request sent
  socket.on('friend request sent', username => {
    socket.broadcast.emit('friend request received', username);
  });

  // Friend request accepted
  socket.on('friend request accepted', () => {
    console.log('Friend request is accepted');
    socket.broadcast.emit('friend request accepted');
  });

  // Someone is drawing on the canvas
  socket.on('draw', (data) => {
    socket.to(data.room).emit('draw', data);
  });

  socket.on('clear', room => {
    if (!room) return;
    socket.to(room.name).emit('clear canvas');
  });

  // Get settings of room
  socket.on('get settings', room => {
    const settings = roomObjects[room];
    socket.emit('get settings', settings);
  });

  // Change room settings
  socket.on('change room', (lobby, user) => {
    if (user.username != lobby.host || !lobby) return;

    const changingRoom = roomObjects[lobby.name];

    changingRoom.size     = lobby.size;
    changingRoom.type     = lobby.type;
    changingRoom.drawTime = lobby.drawTime;
    changingRoom.rounds   = lobby.rounds;
    
    socket.emit('room changed', roomObjects[lobby.name]);
  });

  // Send Lobby message
  socket.on('send lobby message', (message, sender) => {
    console.log(`${sender.username} is sending a message in ${sender.currentRoom.name}`);
    socket.to(sender.currentRoom.name).emit('lobby message received', message, sender);
  });

  // Starting game
  socket.on('starting game', startingRoom => {
    if (startingRoom.playerCount >= 2) {

      startingRoom.round = 1;
      startingRoom.playersThatDrew = [];
      startingRoom.playersThatFoundWord = [];

      const newRoom = nextPlayer(startingRoom);

      // Send starting event to all clients in the room
      io.in(startingRoom.name).emit('game starting', newRoom);

    } else {
      socket.emit('need more players');
    }

  });
  
  // Word has been chosen
  socket.on('word chosen', (room, word) => {

    playingRoomObjects[room.name].wordChosen = true;
    playingRoomObjects[room.name].wordToFind = word;

    let hiddenWord = '';
    for (let i = 0; i < word.length; i++) {
      let letter = word[i];
      if (letter !== ' ') {
        letter = '_';
      }
      hiddenWord += letter;
    }

    io.in(room.name).emit('player starts drawing', hiddenWord);
  });

  // Someone send a message in the game chat
  socket.on('send game message', (user, message) => {
    const wordToFind = playingRoomObjects[user.playingRoom.name].wordToFind;

    if ((message.toLowerCase() === wordToFind.toLowerCase()) && user.username !== user.playingRoom.drawingUser && user.playingRoom.wordChosen) { 

      playingRoomObjects[user.playingRoom.name].playersThatFoundWord.push(user.username);
      user.playingRoom.playersThatFoundWord = [...playingRoomObjects[user.playingRoom.name].playersThatFoundWord];

      let score;
      let thisRoundScore;
      for (let i = 0; i < user.playingRoom.players.length; i++) {
        const currentPlayer = user.playingRoom.players[i];

        if (currentPlayer.username === user.username) {
          if (!currentPlayer.score) currentPlayer.score = 0;          
          thisRoundScore = (10 * user.playingRoom.drawingDuration);
          currentPlayer.score += thisRoundScore;
          currentPlayer.scoreChange = thisRoundScore;

          score = currentPlayer.score;
        } else if (currentPlayer.username === user.playingRoom.drawingUser) {
          if (!currentPlayer.score) currentPlayer.score = 0;
          if (!currentPlayer.scoreChange) currentPlayer.scoreChange = 0;
          currentPlayer.score += 50;
          currentPlayer.scoreChange += 50;
        }
      }

      playingRoomObjects[user.playingRoom.name].players = [...user.playingRoom.players];

      // Set score in playingRoom
      io.in(user.playingRoom.name).emit('word found', user, score, thisRoundScore, message);

      if (user.playingRoom.playersThatFoundWord.length >= user.playingRoom.guessingPlayersInThisRound.length) {
        const nextRoom = nextPlayer(playingRoomObjects[user.playingRoom.name]);
        
        console.log(`Ending drawing round`);

        io.in(user.playingRoom.name).emit('drawing end', nextRoom);

      }

    } else {
      socket.to(user.playingRoom.name).emit('game chat message', user, message);
    }

  });

  // Next player to draw
  socket.on('start next player', room => {
    const nextPlayerRoom = nextPlayer(room)
    io.in(room.name).emit('next player', nextPlayerRoom);
  });

  // Start new round
  socket.on('start new round', room => {
    nextRound(room);
  });

  // kick
  socket.on('kick player', (username, socketID, room) => {
    console.log(`Kicking ${username} from ${room}`);

    try {
      let leavingUser;
      // Delete user out of room
      for (let i = 0; i < roomObjects[room].players.length; i++) {
        const player = roomObjects[room].players[i];

        leavingUser = player;

        if (player.username === username) {
          roomObjects[room].players.splice(i, 1);
          roomObjects[room].playerCount -= 1;
          roomObjects[room].playerNames.splice(roomObjects[room].playerNames.indexOf(username), 1);

          if (!socketID) break;

          io.of('/').connected[socketID].leave(room)

          io.to(socketID).emit('you have been kicked');

          break;
        }

      }

      io.in(room).emit('someone is kicked', leavingUser, roomObjects[room]);

    } catch (error) {
      console.log(error);
      socket.emit('error', 'Could not leave the room');
    }


  });

  // Game has ended
  socket.on('game ended', room => {
    // Deleting room out of playingRoomObjects
    delete playingRoomObjects[room];
  });

  // Private Chat
  socket.on('send private message', (senderID, username, message) => {
    if (message == '') return;

    const keys = Object.values(connectedUsers);

    for (const user in keys) {

      const entry = keys[user];

      if (entry.username === username) {
        io.to(entry.socketId).emit('message received', message, senderID);
        return;
      }

    }

  });

  socket.on('friend deleted', () => {
    // TODO find better way to send this
    io.emit('friend deleted')
  });

  socket.on('invite sent', (username) => {
    io.emit('notification received', username);
  });

});

function nextPlayer(room) {

  if (!room.drawQueue) {
    // Make NEW array of players and add to room object
    room.drawQueue = [...room.playerNames];

  }

  room.guessingPlayersInThisRound = [...room.playerNames];

  let drawingUser;
  drawingUser = room.drawQueue[0];

  // if (room.drawQueue.length > 1) {
  //   drawingUser = room.drawQueue[Math.floor(Math.random() * room.drawQueue.length)];
  // } else {
  // }

  room.drawingUser = drawingUser;

  console.log('DrawingUser: ', drawingUser);

  // Delete drawingUser out of quessing array
  room.guessingPlayersInThisRound = [...room.playerNames];
  room.guessingPlayersInThisRound.splice(room.guessingPlayersInThisRound.indexOf(drawingUser), 1);

  playingRoomObjects[room.name] = room;
  playingRoomObjects[room.name].playersThatFoundWord = [];
  playingRoomObjects[room.name].wordChosen = false;
  playingRoomObjects[room.name].wordToFind = '';
  playingRoomObjects[room.name].drawingDuration = playingRoomObjects[room.name].drawTime;


  return room;
}

function nextRound(room) {
  room.round += 1;

  // Reset all "settings"
  room.drawQueue = [...room.playerNames];
  room.playersThatDrew = [];
  room.playersThatFoundWord = [];
  
  if (room.round <= room.rounds) {
    io.in(room.name).emit('next player', nextPlayer(room));
  } else {
    // End the game
    io.in(room.name).emit('game ending', playingRoomObjects[room.name]);
  }

}



http.listen(port, function() {
  console.log("listening on *:" + port);
});
