<?php

session_start();

if (!isset($_SESSION['username'])) {
    $guest = true;
} else {
    $guest = false;
}



?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/hub.css">
    <link rel="stylesheet" href="css/lobby.css">
    <link rel="stylesheet" href="css/nav.css">
    <link rel="stylesheet" href="css/canvas.css">
    <link href="https://fonts.googleapis.com/css?family=Merriweather|Source+Sans+Pro:300,400,600,700,900&display=swap" rel="stylesheet">
    <script src="admin/js/nav.js"></script>
    <title>Pictionary Shit</title>
</head>
<body>
    <?php
        include_once 'includes/nav.php';
    ?>

    <div id="guestUserModal" class="guest-modal hide">
        <div class="guest-modal--content">
            <h2 class="guest-modal--header">Play as guest!</h2>
            <form class="guest-modal__form">
                <label for="username">Username</label>
                <input name="username" id="guestUsername" type="text" class="guest-modal__form--input" placeholder="Username">
                <div class="button__wrapper">
                    <input class="button__wrapper--btn" type="submit" name="guestSubmitButton" value="Play as guest">
                    <img src="assets/img/right-arrow.svg" alt="->" class="button--img">    
                </div>
            </form>
            <span class="guest-modal--span">Or make an account</span>
        </div>
    </div>
    <div class="container">
        <div id="gameBrowse" class="game-browse">
            <div class="side-img image__wrapper">
                <img src="assets/img/canvas-stand.png" alt="Draw" class="image">
            </div>

            <div class="game-browse__content">
                <h2 class="game-browse--title">Start Drawing!</h2>
                <div id="mainMenu" class="main-menu game-browse__content--room-choice">
                    <div data-action="create-game" class="game-browse__content--tile">
                        <div class="image__wrapper">
                            <img src="assets/img/toolbox.png" alt="Create Room" class="image">
                        </div>
                        <div class="tile-content">
                            <h3 class="tile-content--title">Create a room</h3>
                        </div>
                    </div>
                    <div data-action="join-game" id="getRooms" class="game-browse__content--tile">
                        <div class="image__wrapper">
                            <img src="assets/img/group.jpg" alt="Join Room" class="image">
                        </div>
                        <div class="tile-content">
                            <h3 class="tile-content--title">Join a room</h3>
                        </div>
                    </div>
                </div>
                <div id="createRoom" class="sub-menu create_room hide">
                    <div class="return-btn">
                        <img src="assets/img/return-arrow.svg" alt="Back to main menu" class="return-img">
                    </div>
                    <form class="form" action="">
                        <div class="flex__wrapper">
                            <div class="input_wrapper room-name">
                                <label for="room-name">Room Name</label><br>
                                <input class="form-input-text" name="room-name" type="text" placeholder="<?php echo $_SESSION['username'] ?>'s room" id="roomName">
                            </div>
                            <div class="input_wrapper room-size">
                                <label for="room-size">Room Size</label><br>
                                <input class="form-input-number" name="room-size" type="number" placeholder="12" max="12" min="2" id="roomSize">
                            </div>
                        </div>
                        <div class="flex__wrapper">
                            <div class="input_wrapper room-rounds">
                                <label class="slider__label" for="draw-rounds">Rounds</label><br>
                                <input type="number" class="form-input-number" name="draw-rounds" id="roomRounds" min="2" max="20" placeholder="5">
                            </div>
                            <div class="input_wrapper room-draw-time">
                                <label class="slider__label" for="draw-time">Draw Time (sec)</label><br>
                                <input type="number" class="form-input-number" name="draw-time" id="roomTime" min="15" max="120" placeholder="60">
                            </div>
                        </div>
                        <div class="flex__wrapper">
                            <div class="input_wrapper room-private">
                                <div class="checkbox__wrapper">
                                    <label class="slider__label" for="private-room">Private Room</label>
                                    <div class="slider__wrapper">
                                        <input type="checkbox" class="slider-input" name="private-room" id="private-room">
                                        <span class="slider"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button class="form-input-submit" id="createRoomBtn">Create Room</button>
                    </form>
                </div>
                <div id="joinRoom" class="sub-menu join_room hide">
                    <div class="return-btn">
                        <img src="assets/img/return-arrow.svg" alt="Back to main menu" class="return-img">
                    </div>
                    <div id="reloadRoomList" class="refresh-btn">
                        <img src="assets/img/reload.svg" alt="Reload Room List" class="return-img">
                    </div>
                    <div id="table-scroll">
                        <table class="rooms-list" rules="groups">
                            <thead class="table-header">
                                <tr class="room-list__item">
                                    <td>Room Name</td>
                                    <td>Host</td>
                                    <td>Slots</td>
                                    <td>Type</td>
                                </tr>
                            </thead>
                            <tbody id="roomList">
                               
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="container">
        <div id="lobby" class="lobby hide">
            <div class="lobby__close">
                <img src="assets/img/closebutton.svg" alt="Close" class="close__btn">
            </div>
            <div id="lobbySettingsBtn" class="lobby__settings--btn hide">
                <img src="assets/img/settings.svg" alt="Settings" class="settings__btn">
            </div>
            <div class="lobby__content">
                <h2 class="lobby--header">Lobby</h2>
                <div class="lobby__content--elements">
                    <div id="lobbyPlayers" class="lobby__content--element lobby__players">
                        <ul class="players">

                        </ul>
                    </div>
                    <div id="lobbyChat" class="lobby__content--element lobby__chat">
                        <div class="chat">
                            <ul id="lobbyChatMessages">

                            </ul>
                        </div>
                        <div class="send-msg">
                            <form id="lobbyChatForm" class="send-msg-form">
                                <input id="lobbySend" type="text" placeholder="Send message..." name="send-message" autocomplete="off">
                                <input type="submit" id="sendLobbyMessage" value="Send">
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div id="startGameBtn" class="start-game__btn hide"><span>Start Game</span><img src="assets/img/start.svg" alt="Start Game" class="start-game__icon"></div>
        </div>
    </div>

    <div id="settingsModal" class="settings--modal hide">
        <div class="settings__close">
            <img src="assets/img/closebutton.svg" alt="Close" class="close__btn">
        </div>
        <div id="lobbySettings" class="lobby__content--element lobby__settings">
            <form class="lobby-form">
                <div class="flex__wrapper">
                    <div class="input_wrapper room-players">
                        <div class="room-name">
                            <label class="slider__label" for="room-players">Room name</label><br>
                            <input id="lobbySettingsRoomName" class="form-input-text" type="text" value="" autocomplete="off" disabled>
                        </div>
                    </div> 
                    <div class="input_wrapper room-players">
                        <label class="slider__label" for="room-players">Number of Players</label><br>
                        <input id="lobbySettingsRoomPlayers" class="form-input-number" min="2" max="12" name="room-players" type="number" value="12">
                    </div>
                </div>
                <div class="flex__wrapper">
                    <div class="input_wrapper room-rounds">
                        <label class="slider__label" for="draw-rounds">Rounds</label><br>
                        <input id="lobbySettingsRounds" type="number" class="form-input-number" name="draw-rounds" min="2" max="20" placeholder="5">
                    </div>
                    <div class="input_wrapper room-draw-time">
                        <label class="slider__label" for="draw-time">Draw Time (sec)</label><br>
                        <input id="lobbySettingsDrawTime" type="number" class="form-input-number" name="draw-time" min="15" max="120" placeholder="60">
                    </div>
                </div>
                <div class="flex__wrapper">
                    <div class="input_wrapper room-private">
                        <div class="checkbox__wrapper">
                            <label class="slider__label" for="private-room">Private Room</label><br>
                            <div class="slider__wrapper">
                                <input type="checkbox" class="slider-input" name="private-room" id="lobbySettingsType">
                                <span class="slider"></span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="center-btn">
                    <input type="submit" class="form-input-submit" id="changeRoomBtn" value="Change Room">
                </div>
            </form>
        </div>
    </div>


    <div class="container">
        <div class="game__wrapper hide">
            <div id="leavePlayingRoom" class="leave__button">
                <img src="assets/img/closebutton.svg" alt="Leave" class="leave__button--icon">
            </div>
            <div class="gameUI">
                <div class="flex__wrapper">
                    <div class="clock__wrapper">
                        <img src="assets/img/clock.svg" alt="" class="clock--img">
                        <div id="gameDrawingTimer" class="clock--time single-digit">-</div>
                    </div>
                    <div id="currentWord" class="word__wrapper">
                        
                    </div>
                    <div class="round__wrapper">
                        <div id="currentRound"></div>
                        <div id="maxRound"></div>
                    </div>
                </div>
            </div>
            <div id="playerList" class="players-list">
            </div>
            <div id="canvasWrapper" class="canvas__wrapper">
                <div class="choosing__word--overlay hide">
                    <div class="choosing__word--content">
                        <div data-word="Apple" class="word">Apple</div>
                        <div data-word="Car" class="word">Car</div>
                        <div data-word="Coffee Mug" class="word">Coffee Mug</div>
                    </div>
                </div>
                <div class="player-choosing--overlay hide">
                    <div id="playerChoosingMessage" class="player-choosing__message">

                    </div>
                </div>
                <div class="score--overlay hide">
                    <div id="scoreboard" class="score__overlay--board">
                        
                    </div>
                </div>
                <div id="gameEndWrapper" class="game--end hide">
                    <h2>Game Over!</h2>
                    <div id="gameEndScoreboard" class="score__overlay--board">
                        
                    </div>
                </div>
                <canvas id="canvas">
                    
                </canvas>
            </div>
            <div id="gameChat" class="game__chat">
                <div class="chat">
                    <ul id="gameChatMessages">
                    </ul>
                </div>
                <div class="game__send-msg">
                    <form id="gameChatForm" class="send-game__msg-form">
                        <input id="gameSend" type="text" placeholder="Send message..." name="send-message" autocomplete="off">
                    </form>
                </div>
            </div>
            <div class="canvas__controls">
                <div id="clear">
                    <img src="assets/img/clear.svg" alt="Clear" class="clear--icon">
                </div>
                <div class="slidecontainer">
                    <input type="range" min="2" max="100" value="10" class="pencil-width-slider" id="pencilWidth">
                </div>
                <div class="color__wrapper">
                    <div id="colorRed" data-color="#F40000" class="color"></div>
                    <div id="colorGreen" data-color="#00FF01" class="color"></div>
                    <div id="colorYellow" data-color="#FFFF11" class="color"></div>
                    <div id="colorOrange" data-color="#FF6400" class="color"></div>
                    <div id="colorBlue" data-color="#0505A5" class="color"></div>
                    <div id="colorPink" data-color="#FA02F9" class="color"></div>
                    <div id="colorPurple" data-color="#632A9F" class="color"></div>
                    <div id="colorBlack" data-color="#000000" class="color"></div>
                    <div id="colorWhite" data-color="#FFFFFF" class="color"></div>
                    <div id="colorBrown" data-color="#141518" class="color"></div>
                </div>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="players__list">
            <div id="gamePlayers" class="players">

            </div>
        </div>
    <div class="container">


    <div id="notification" class="notification">
        <div id="notification__content" class="notification__content">
            
        </div>
    </div>

    <script src="admin/js/showNotification.js"></script>
    <script src="admin/js/resetSettings.js"></script>
    <script src="admin/js/handleFormElements.js"></script>



    <?php
        $actual_link = 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF']; 
        $host = explode(':', $actual_link)[1];
    ?>
    <script src="http://<?php echo $host ?>:3000/socket.io/socket.io.js"></script>
    <!-- <script src="admin/js/clientSocket.js"></script> -->

    
    <script>

        const userIsGuest = '<?php echo $guest ?>';

        // if (userIsGuest === 'true') {

        //     return;            
        // }

        const user = {
            username: '<?php echo $_SESSION['username'] ?>',
            level: <?php echo $_SESSION['level']?>,
            country: '<?php echo $_SESSION['country']?>',
            joinedRoom: false,
            currentRoom: ''
        }
        
        const socket = io.connect(':3000', { query: `username=${user.username}`});

        socket.on('connected', () => {
            user.socketId = socket.id;
        });
        

        let roundTimer;
        let wordPickingTimeOut;
        let audio = new Audio();

        socket.on('user disconnected', () => {
            console.log('User is disconnecting');
            if (user.currentRoom) {
                socket.emit('leave room', user.currentRoom.name, user);
            }
        });
        

    </script>
    <script src="admin/js/canvas.js"></script>
    <script>
        

    </script>
    <!-- Lobby scripts -->
    <script src="admin/helpers/room.js"></script>
    <script src="admin/actions/createRoom.js"></script>
    <script src="admin/actions/joinRoom.js"></script>
    <script src="admin/actions/leaveRoom.js"></script>
    <script src="admin/actions/changeRoom.js"></script>
    <script src="admin/actions/kickPlayer.js"></script>
    <script src="admin/actions/startGame.js"></script>
    <script src="admin/actions/chat.js"></script>

    <!-- Game -->
    <script src="admin/actions/gameChat.js"></script>
    <script src="admin/actions/game.js"></script>


    

    <script>
        document.addEventListener('DOMContentLoaded', e => {
            window.onbeforeunload = (e) => {
                e.preventDefault();
                if (user.joinedRoom == true) {
                    return 'Are you sure you want to leave the game?';
                }
            }
        });
    </script>
    

</body>
</html>