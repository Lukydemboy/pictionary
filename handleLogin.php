<?php
session_start();

if (!isset($_POST['loginBtn'])) {
    header('location:index.php');
}

include_once 'admin/includes/connection.php';

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
    }

    if (password_verify($_POST['password'], $password)) {
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