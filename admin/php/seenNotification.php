<?php

include_once '../includes/connection.php';

if (!isset($_POST['notificationID'])) return;

$notificationID = $_POST['notificationID'];

$seen = 1;

$STH = $DBH -> prepare('UPDATE Notifications SET Seen = :Seen WHERE NotificationID = :NotificationID');
$STH -> bindParam(':Seen', $seen);
$STH -> bindParam(':NotificationID', $notificationID);

$STH -> execute();
