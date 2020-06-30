<?php
session_start();

include_once('../includes/connection.php');

if (!isset($_SESSION['username'])) return;

$username = $_SESSION['username'];

if ($_SESSION['userType'] == 'guest') {
    $STH = $DBH -> prepare('DELETE FROM guestUsers WHERE Username = :username');
    $STH -> bindParam(':username', $username);
    $STH -> execute();

    echo 'Guest deleted from DB';
}
