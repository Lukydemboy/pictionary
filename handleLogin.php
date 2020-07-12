<?php
session_start();

if (!isset($_POST['loginBtn']) || !isset($_POST['act'])) {
    header('location:index.php?actNotFound');
}

print_r($_POST);

include_once 'admin/includes/connection.php';

$act = $_POST['act'];

switch ($act) {
    case 'login':
        $STH = $DBH -> prepare('SELECT * FROM Users WHERE Username = :username');
        $STH -> bindParam(':username', $_POST['username']);
        $STH -> setFetchMode(PDO::FETCH_OBJ);

        $STH -> execute();

        $found = $STH -> rowCount();

        if ($found > 0) {
            while ($row = $STH->fetch()) {
                $username   = $row -> Username;
                $password   = $row -> Password;
                $country    = $row -> Country;
                $level      = $row -> Level;
                $userID     = $row -> UserID;
            }

            if (password_verify($_POST['password'], $password)) {
                $_SESSION['userID']     = $userID;
                $_SESSION['username']   = $username;
                $_SESSION['token']      = 'LDP19980317';
                $_SESSION['country']    = $country;
                $_SESSION['level']      = $level;
                $_SESSION['userType']   = 'registered';
                
                header('location:hub.php');
            } else {
                header('location:index.php?err=wrongLogin');
            }

        }

        // Set user online state to online
        $onlineState = 1;

        $STHUPD = $DBH -> prepare('UPDATE Users SET OnlineState = :onlineState WHERE Username = :username');
        $STHUPD -> bindParam(':username', $_POST['username']);
        $STHUPD -> bindParam(':onlineState', $onlineState);

        $STHUPD -> execute();

        break;

    case 'register':

        // Set sessions to save the user inputs from register fields
        $_SESSION['registerUsername']   = $_POST['username'];
        $_SESSION['registerEmail']      = $_POST['registerEmail'];

        $STHCHECK = $DBH -> prepare('SELECT * FROM Users WHERE Email = :email OR Username = :username');
        $STHCHECK -> bindParam(':email', $_POST['registerEmail']);
        $STHCHECK -> bindParam(':username', $_POST['username']);

        $STHCHECK -> setFetchMode(PDO::FETCH_OBJ);

        $STHCHECK -> execute();

        $rows = $STHCHECK -> rowCount();

        while ($row = $STHCHECK -> fetch()) {
            $dbUsername     = $row -> Username;
            $dbEmail        = $row -> Email;
        }

        echo $dbUsername;
        echo $dbEmail;

        // Error messages in register
        if (strtolower($dbUsername) == strtolower($_POST['username']) && strtolower($dbEmail) == strtolower($_POST['registerEmail'])) {
            header('location:index.php?msg=emailUsernameUsed');
            exit();
        } else if (strtolower($dbUsername) == strtolower($_POST['username'])) {
            header('location:index.php?msg=usernameUsed');
            exit();
        } else if (strtolower($dbEmail) == strtolower($_POST['registerEmail'])) {
            header('location:index.php?msg=emailUsed');
            exit();
        }

        if ($rows == 0) {
            $hashedPassword = password_hash($_POST['password'], PASSWORD_DEFAULT);

            // Get country based on IP
            $ip =  '2a02:1811:9426:1a00:2f:dcdd:bf22:f192';
    // $_SERVER['REMOTE_ADDR']
            $url = 'https://api.ipregistry.co/' . $ip . '?key=' . $ipregisteryKey . '&fields=location.country.name';

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $result = curl_exec($ch);
            $result = json_decode($result, true);
            $country = $result['location']['country']['name'];
            curl_close($ch);

            $STH = $DBH -> prepare('INSERT INTO Users (Username, Password, Email, Country) VALUES (:username, :password, :email, :country)');

            $STH -> bindParam(':username', $_POST['username']);
            $STH -> bindParam(':password', $hashedPassword);
            $STH -> bindParam(':email', $_POST['registerEmail']);
            $STH -> bindParam(':country', $country);

            $STH -> execute();

            $userID = $DBH -> lastInsertId();

            $_SESSION['userID']     = $userID;
            $_SESSION['username']   = $_POST['username'];
            $_SESSION['token']      = 'LDP19980317';
            $_SESSION['country']    = $country;
            $_SESSION['level']      = 1;
            $_SESSION['userType']   = 'registered';

            session_unset($_SESSION['registerUsername']);
            session_unset($_SESSION['registerEmail']);

            header('location:hub.php');


        } else {
            header('location:index.php?msg=usernameUsed');
            exit();
        }
        
        break;
    
}
