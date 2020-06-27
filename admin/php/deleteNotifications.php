<?php

session_start();

include_once '../includes/connection.php';

if (!isset($_POST['notificationID'])) return;

$notID = $_POST['notificationID'];
$deleted = 1;

$STH = $DBH -> prepare('UPDATE Notifications SET Deleted = :deleted WHERE NotificationID = :notID');
$STH -> bindParam(':notID', $notID);
$STH -> bindParam(':deleted', $deleted);

$STH -> execute();

echo 'Notification Deleted';