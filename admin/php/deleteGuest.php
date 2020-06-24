<?php
session_start();

include_once('../includes/connection.php');

if (!isset($_SESSION['username'])) return;

// $username = $_POST['username'];

$username = $_SESSION['username'];

$STH = $DBH -> prepare('DELETE FROM guestUsers WHERE Username = :username');
$STH -> bindParam(':username', $username);
$STH -> execute();
