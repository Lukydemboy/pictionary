<?php

session_start();

include_once '../includes/connection.php';

if (!isset($_POST['act'])) return;

$act = $_POST['act'];

// print_r($_POST);

switch ($act) {

    case 'add':
        // Add msg to Messages DB
        $STH = $DBH -> prepare('INSERT INTO Messages (MessageType, Message, SenderID) VALUES (:msgType, :msgText, :senderID)');
        $STH -> bindParam(':msgType', $_POST['type']);
        $STH -> bindParam(':msgText', $_POST['msg']);
        $STH -> bindParam(':senderID', $_POST['senderid']);

        $STH -> execute();

        $msgId = $DBH -> lastInsertId();

        // Add to receivers DB
        $STHRECIPIENTS = $DBH -> prepare('INSERT INTO MessageRecipients (MessageID, UserID) VALUES (:msgID, :recID)');
        $STHRECIPIENTS -> bindParam(':msgID', $msgId);
        $STHRECIPIENTS -> bindParam(':recID', $_POST['recid']);

        $STHRECIPIENTS -> execute();

        // Add Status to MessageStatus DB
        $isRead = 0;
        $readDate = 0;
        $isDeleted = 0;
        $deletedDate = 0;

        $STHSTATUS = $DBH -> prepare('  INSERT INTO MessageStatus (MessageID, UserID, IsRead, IsDeleted) 
                                        VALUES (:msgID, :recID, :isRead, :isDeleted)');
        $STHSTATUS -> bindParam(':msgID', $msgId);
        $STHSTATUS -> bindParam(':recID', $_POST['recid']);
        $STHSTATUS -> bindParam(':isRead', $isRead);
        $STHSTATUS -> bindParam(':isDeleted', $isDeleted);

        $STHSTATUS -> execute();

    case 'get':
        $globalType = 'Global Message';
        $deleted = 0;

        $STH = $DBH -> prepare('SELECT * FROM Messages M 
                                LEFT JOIN MessageRecipients MR ON MR.MessageID = M.MessageID 
                                LEFT JOIN MessageStatus MS ON MS.MessageID = M.MessageID 
                                WHERE (MS.IsDeleted = :deleted) && (MR.UserID = :userID OR M.SenderID = :userID OR M.MessageType = :globalType)');
        $STH -> bindParam(':deleted', $deleted);
        $STH -> bindParam(':userID', $_POST['friendid']);
        // $STH -> bindParam(':senderID', $_POST['userid']);
        $STH -> bindParam(':globalType', $globalType);

        $STH -> setFetchMode(PDO::FETCH_OBJ);

        $STH -> execute();

        $msgArray = [];
        $i = 0;
        while ($row = $STH -> fetch()) {
            $msg = (object) [
                'msgBody' => $row -> Message,
                'senderID' => $row -> SenderID,
                'sendDate' => $row -> TimeStamp,
                'msgStatus' => $row -> IsRead,
                'receiverID' => $row -> UserID
            ];
            $msgArray[$i] = $msg;
            $i++;
        }

        echo json_encode($msgArray);

}
