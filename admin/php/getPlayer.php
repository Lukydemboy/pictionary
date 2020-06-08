<?php
session_start();

include_once('../includes/connection.php');

if (!isset($_POST['playerName'])) {
    return;
}

$username = $_POST['playerName'];

$STH = $DBH -> prepare('SELECT * FROM Users WHERE Username = :username');

$STH -> bindParam(':username', $username);

$STH -> setFetchMode(PDO::FETCH_OBJ);

$STH -> execute();

$found = $STH -> rowCount();

$player = 'Player not found';

if ($found > 0) {
    while ($row = $STH->fetch()) {

        $player = (object) [
            'registerDate' => $row -> RegistrationDate,
            'level' => $row -> Level,
            'country' => $row -> Country
        ];

    }


    print_r(json_encode($player));
}

