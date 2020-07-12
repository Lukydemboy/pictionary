<?php
session_start();

if (isset($_GET['msg'])) {
    if ($_GET['msg'] == 'guestLeft') {
        session_destroy();
    }
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/login.css">
    <link rel="stylesheet" href="css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;300;400;600&display=swap" rel="stylesheet">

    <title>Pictionary</title>
</head>
<body>
    <div id="guestUserModal" class="guest-modal hide">
        <div class="guest-modal--content">
            <h2 class="guest-modal--header">Play as guest!</h2>
            <form id="guestUserModalForm" class="guest-modal__form">
                <label for="username">Username</label>
                <input name="username" id="guestUsername" type="text" class="guest-modal__form--input" placeholder="Username">
                <div id="guestUserModalMessage" class="guest-modal__form--message"></div>
                <div class="button__wrapper">
                    <input class="button__wrapper--btn" type="submit" name="guestSubmitButton" value="Play as guest">
                    <img src="assets/img/right-arrow.svg" alt="->" class="button--img">    
                </div>
            </form>
            <span class="guest-modal--span">Or make an account</span>
        </div>
    </div>
    <div id="loginModal" class="login__wrapper">
        <div class="center">
            <div class="login">
                <form id="form" action="handleLogin.php" method="POST">
                    <div class="login__username login__input">
                        <label for="username">Username</label>
                        <input type="text" class="<?php if (isset($_GET['msg'])) { if ($_GET['msg'] === 'usernameUsed' || $_GET['msg'] === 'emailUsernameUsed') { echo 'taken'; }}?>" name="username" value="<?php if (isset($_SESSION['registerUsername'])) { echo $_SESSION['registerUsername']; } ?>" id="username" placeholder="Username" required>
                        <?php 
                            if (isset($_GET['msg'])) {
                                if ($_GET['msg'] === 'usernameUsed' || $_GET['msg'] == 'emailUsernameUsed') {
                                    echo '<div class="input-errormsg">
                                            This username is already in use.
                                        </div>';
                                }
                            }
                        ?>
                    </div>
                    <div id="registerEmail" class="login__input hidden">
                        <label for="registerEmail">Email</label>
                        <input class="<?php if (isset($_GET['msg'])) { if ($_GET['msg'] === 'emailUsed' || $_GET['msg'] === 'emailUsernameUsed') { echo 'taken'; }} ?>" type="email" value="<?php if (isset($_SESSION['registerEmail'])) { echo $_SESSION['registerEmail']; } ?>" name="registerEmail" placeholder="Email" required>
                        <?php 
                            if (isset($_GET['msg'])) {
                                if ($_GET['msg'] === 'emailUsed' || $_GET['msg'] === "emailUsernameUsed") {
                                    echo '<div class="input-errormsg">
                                            This email is already in use.
                                        </div>';
                                }
                            }
                        ?>
                    </div>
                    <div class="login__password login__input">
                        <label for="password">Password</label>
                        <input type="password" name="password" id="password" placeholder="Password" required>
                    </div>
                    <div class="button__wrapper">
                        <input type="hidden" id="actInput" name="act" value="login">
                        <input id="submitButton" class="login__btn" type="submit" name="loginBtn" value="Login">
                        <img src="assets/img/right-arrow.svg" alt="->" class="button--img">
                    </div>
                    
                </form>
                <div class="login-register">
                    <span id="loginRegister" class="login-register--text"><a id="otherChoice" href="">Or make an account</a></span>
                </div>
            </div>
        </div>
    </div>

    <script>
        
        const $_GET = {};
        if(document.location.toString().indexOf('?') !== -1) {
            const query = document.location
                        .toString()
                        .replace(/^.*?\?/, '')
                        .replace(/#.*$/, '')
                        .split('&');

            for(let i=0, l=query.length; i<l; i++) {
                const aux = decodeURIComponent(query[i]).split('=');
                $_GET[aux[0]] = aux[1];
            }
        }

        if ($_GET['act'] == 'joinRoom') {
            const guestModalDOM = document.getElementById('guestUserModal');
            const loginModalDOM = document.getElementById('loginModal');
        
            guestModalDOM.classList.remove('hide');
            loginModalDOM.classList.add('hide');
        }

        const guestUserModalForm = document.getElementById('guestUserModalForm');
        const guestUserModalFormUsername = document.getElementById('guestUsername');
        const guestUserModalFormMessage = document.getElementById('guestUserModalMessage');

        guestUserModalForm.addEventListener('submit', e => {
            e.preventDefault();

            const username = guestUserModalFormUsername.value;

            // Check if username is in DB
            const xhr = new XMLHttpRequest();

            xhr.open('POST', 'admin/php/checkGuest.php', true);

            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function () {
                if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                    const usernameStatus = xhr.response;
                    
                    if (usernameStatus === 'taken') {
                        guestUserModalFormUsername.classList.add('error');
                        guestUserModalFormMessage.innerHTML = 'Username is already taken!'
                    } else if (usernameStatus === 'open') {
                        window.location = `hub.php?action=joiningRoom&username=${username}`;
                    }

                }
            }

            xhr.send(`playerName=${username}`);

        });

    </script>

    <script>
        const msg = '<?php echo $_GET['msg'] ?>';
    </script>

    <script src="admin/actions/register.js"></script>

</body>
</html>