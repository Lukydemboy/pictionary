<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/login.css">
    <link rel="stylesheet" href="css/style.css">
    <link href="https://fonts.googleapis.com/css?family=Merriweather|Source+Sans+Pro:300,400,600,700,900&display=swap" rel="stylesheet">

    <title>Pictionary</title>
</head>
<body>
    <div class="login__wrapper">
        <div class="center">
            <div class="login">
                <form action="handleLogin.php" method="POST">
                    <div class="login__username login__input">
                        <label for="username">Username</label>
                        <input type="text" name="username" id="username" placeholder="Username">
                    </div>
                    <div class="login__password login__input">
                        <label for="password">Password</label>
                        <input type="password" name="password" id="password" placeholder="Password">
                    </div>
                    <div class="button__wrapper">
                        <input class="login__btn" type="submit" name="loginBtn" value="Login">
                        <img src="assets/img/right-arrow.svg" alt="->" class="button--img">
                    </div>
                </form>
            </div>
        </div>
    </div>
</body>
</html>