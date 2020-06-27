<?php
session_start();

include_once '../includes/connection.php';

if (!isset($_POST['act'])) return;

$act = $_POST['act'];

switch($act) {

    case "add":
        if (!isset($_POST['friendUserID'])) return;

        $userOneID = $_SESSION['userID'];
        $userOneUsername = $_SESSION['username'];

        $userTwoID = $_POST['friendUserID'];
        $userTwoUsername = $_POST['username'];

        $status = 'pending';

        // Check if users are friends already or friend request is already sent.
        $STHCHECK = $DBH -> prepare('SELECT FriendsID FROM Friends WHERE (UserOne = :userOneID AND UserTwo = :userTwoID) OR (UserOne = :userTwoID AND UserTwo = :userOneID)');
        $STHCHECK -> bindParam(':userOneID', $userOneID);
        $STHCHECK -> bindParam(':userTwoID', $userTwoID);

        $STHCHECK -> setFetchMode(PDO::FETCH_OBJ);

        $STHCHECK -> execute();

        $found = $STHCHECK -> rowCount();

        if ($found == 0) {
            // Add friends
            $STH = $DBH -> prepare('INSERT INTO Friends (UserOne, UserTwo, UserOneUsername, UserTwoUsername) VALUES (:userOneID, :userTwoID, :userOneUsername, :userTwoUsername)');

            $STH -> bindParam(':userOneID', $userOneID);
            $STH -> bindParam(':userTwoID', $userTwoID);
            $STH -> bindParam(':userOneUsername', $userOneUsername);
            $STH -> bindParam(':userTwoUsername', $userTwoUsername);

            $STH -> execute();

            $friendIDDB = $DBH -> lastInsertId();

            // Add notification
            $type = 'Friend Request';
            $body = '
                    <h3 class="notification-title">Friend Request received from ' . $userOneUsername . '!</h3>
                    <div class="button__wrapper">
                        <button data-id="'.$friendIDDB.'" data-action="accept" class="friend-response-btn accept-friend-request">Accept</button>
                        <button data-id="'.$friendIDDB.'" data-action="deny" class="friend-response-btn deny-friend-request">Deny</button>
                    </div>
                    ';

            $STHNOT = $DBH -> prepare('INSERT INTO Notifications (UserID, Type, Body, Url, SenderID) VALUES (:userID, :type, :body, :url, :senderID)');

            $STHNOT -> bindParam(':userID', $userTwoID);
            $STHNOT -> bindParam(':type', $type);
            $STHNOT -> bindParam(':body', $body);
            $STHNOT -> bindParam(':url', $url);
            $STHNOT -> bindParam(':senderID', $userOneID);

            $STHNOT -> execute();

        }
        
        echo 'success';

        break;

    case "upd":
        $friendReqID = $_POST['friendReqID'];
        $status = $_POST['status'];

        $STH = $DBH -> prepare('UPDATE Friends SET Status = :status WHERE FriendsID = :friendReqID');

        $STH -> bindParam(':friendReqID', $friendReqID);
        $STH -> bindParam('status', $status);

        $STH -> execute();

        echo $status;

        break;

    default:
        return;

}





