<?php
session_start();
include_once('../includes/connection.php');

if (!isset($_POST['playerName'])) {
    return;
}

$username = $_POST['playerName'];
$level = 1;
$country = 'Belgium';
$usernameStatus;

$STH = $DBH -> prepare('SELECT * FROM Users, guestUsers WHERE Users.Username = :username OR guestUsers.Username = :username');

$STH -> bindParam(':username', $username);

$STH -> setFetchMode(PDO::FETCH_OBJ);

$STH -> execute();

$found = $STH -> rowCount();

if ($found > 0) {
    $usernameStatus = 'taken';
} else {
    $usernameStatus = 'open';

    $STHADD = $DBH -> prepare('INSERT INTO guestUsers (Username, Level, Country) VALUES (:username, :level, :country)');

    $STHADD -> bindParam(':username', $username);
    $STHADD -> bindParam(':level', $level);
    $STHADD -> bindParam(':country', $country);

    $STHADD -> execute();
}

echo $usernameStatus;