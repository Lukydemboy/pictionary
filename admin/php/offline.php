<?php
session_start();

include_once('../includes/connection.php');

print_r($_SESSION);

if (!isset($_SESSION['username'])) return;

$username = $_SESSION['username'];

if ($_SESSION['userType'] == 'guest') {
    $STH = $DBH -> prepare('DELETE FROM guestUsers WHERE Username = :username');
    $STH -> bindParam(':username', $username);
    $STH -> execute();

    echo 'Guest deleted from DB';
}
// else if ($_SESSION['userType'] == 'registered') {
//     $offlineState = 0;

//     $STH = $DBH -> prepare('UPDATE Users SET OnlineState = :offlineState WHERE Username = :username');
//     $STH -> bindParam(':username', $username);
//     $STH -> bindParam(':offlineState', $offlineState);
//     $STH -> execute();

//     echo 'User set to offline';
// }
