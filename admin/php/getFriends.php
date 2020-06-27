<?php
session_start();

include_once '../includes/connection.php';

if (!isset($_SESSION['userID'])) return;

$userID = $_SESSION['userID'];
$status = 'accept';

$STH = $DBH -> prepare('SELECT * FROM Friends INNER JOIN Users ON Friends.UserOne = Users.UserID OR Friends.UserTwo = Users.UserID WHERE (UserOne = :userID OR UserTwo = :userID) AND Friends.Status = :status');

$STH -> bindParam(':userID', $userID);
$STH -> bindParam(':status', $status);

$STH -> setFetchMode(PDO::FETCH_OBJ);

$STH -> execute();

$users = [];
while ($row = $STH->fetch()) {
    $user = [];

    if ($row->UserOne != $userID && $row->UserID != $userID) {
        $user['userID']         = $row -> UserOne;
        $user['username']       = $row -> UserOneUsername;
        $user['onlineState']    = $row -> OnlineState;

        $users[] = $user;
    } else if ($row->UserTwo != $userID && $row->UserID != $userID) {
        $user['userID']         = $row -> UserTwo;
        $user['username']       = $row -> UserTwoUsername;
        $user['onlineState']    = $row -> OnlineState;

        $users[] = $user;
    }


}

echo json_encode($users);
?>