<?php

if (!isset($_POST['act'])) return;

include_once '../includes/connection.php';

$act = $_POST['act'];

switch ($act) {

    case 'add':
        $body = '';

        switch($_POST['type']) {
            case 'Invite':
                $body = makeInviteNotification($_POST['senderID'], $_POST['senderUsername'], $_POST['roomName'], $_POST['type']);
                break;
        }

        $STHNOT = $DBH -> prepare('INSERT INTO Notifications (UserID, Type, Body, Url, SenderID) VALUES (:userID, :type, :body, :url, :senderID)');

        $STHNOT -> bindParam(':userID', $_POST['receivingUserID']);
        $STHNOT -> bindParam(':type', $_POST['type']);
        $STHNOT -> bindParam(':body', $body);
        $STHNOT -> bindParam(':url', $url);
        $STHNOT -> bindParam(':senderID', $_POST['senderID']);

        $STHNOT -> execute();

}


function makeInviteNotification($userID, $senderUsername, $roomName, $type) {

    $body = '
            <h3 class="notification-title">Invite received from ' . $senderUsername . '!</h3>
            <div class="button__wrapper">
                <button data-type="' . $type . '" data-roomName="'. $roomName .'" data-id="'.$userID.'" data-action="accept" class="notification-response-btn accept-notification-request">Accept</button>
                <button data-type="' . $type . '" data-id="'.$userID.'" data-action="deny" class="notification-response-btn deny-notification-request">Deny</button>
            </div>
            ';

    return $body;
}