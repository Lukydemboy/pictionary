<?php

session_start();

include_once 'admin/includes/connection.php';

$username = $_SESSION['username'];

$offlineState = 0;

$STH = $DBH -> prepare('UPDATE Users SET OnlineState = :offlineState WHERE Username = :username');
$STH -> bindParam(':username', $username);
$STH -> bindParam(':offlineState', $offlineState);
$STH -> execute();

session_unset();

header('location:index.php?msg=loggout');