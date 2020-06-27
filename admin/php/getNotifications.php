<?php

session_start();
include_once '../includes/connection.php';


if (!isset($_SESSION['userID'])) return;

$userID = $_SESSION['userID'];

$notDeleted = 0;

$STH = $DBH -> prepare('SELECT * FROM Notifications WHERE UserID = :userID AND Deleted = :notDeleted');
$STH -> bindParam(':userID', $userID);
$STH -> bindParam(':notDeleted', $notDeleted);

$STH -> setFetchMode(PDO::FETCH_OBJ);

$STH -> execute();

$allNotifications = [];

while ($row = $STH->fetch()) {
    $notification = [];

    $notification['id']         = $row -> NotificationID;
    $notification['body']       = $row -> Body;
    $notification['date']       = $row -> Date;
    $notification['type']       = $row -> Type;
    $notification['seen']       = $row -> Seen;
    $notification['senderID']   = $row -> SenderID;
    $notification['url']        = $row -> Url;

    $allNotifications[] = $notification;
}

echo json_encode($allNotifications);

?>