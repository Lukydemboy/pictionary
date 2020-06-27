<?php
session_start();

include_once '../includes/connection.php';

if (!isset($_SESSION['userID'])) return;

$userID = $_SESSION['userID'];
$status = 'accept';

$STH = $DBH -> prepare('SELECT * FROM Friends WHERE (UserOne = :userID OR UserTwo = :userID) AND Status = :status');

$STH -> bindParam(':userID', $userID);
$STH -> bindParam(':status', $status);

$STH -> setFetchMode(PDO::FETCH_OBJ);

$STH -> execute();

$users = [];
while ($row = $STH->fetch()) {
    $user = [];

    if ($row->UserOne != $userID) {
        $user['userID']     = $row -> UserOne;
        $user['username']   = $row -> UserOneUsername;
    } else {
        $user['userID']     = $row -> UserTwo;
        $user['username']   = $row -> UserTwoUsername;
    }

    $users[] = $user;

}

echo json_encode($users);
?>