<?php
session_start();
include_once('../includes/connection.php');

if (!isset($_POST['playerName'])) {
    return;
}

$username = $_POST['playerName'];
$usernameStatus;

$STH = $DBH -> prepare('SELECT * FROM Users WHERE Username = :username');

$STH -> bindParam(':username', $username);

$STH -> setFetchMode(PDO::FETCH_OBJ);

$STH -> execute();

$found = $STH -> rowCount();

if ($found > 0) {
    $usernameStatus = 'taken';
} else {
    $usernameStatus = 'open';
}

echo $usernameStatus;