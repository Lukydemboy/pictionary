<?php

session_start();

include_once '../includes/connection.php';

// print_r($_POST);

if (!isset($_POST['act'])) return;

switch ($_POST['act']) {

    case 'get':
        $STH = $DBH -> prepare('SELECT * FROM Words ORDER BY RAND() LIMIT 3');

        $STH -> setFetchMode(PDO::FETCH_OBJ);

        $STH -> execute();

        $words = [];
        while ($row = $STH -> fetch()) {
            $word = [];

            $word['word'] = $row -> Word;
            $word['difficulty'] = $row -> WordDifficulty;

            $words[] = $word;
        }

        // print_r($words);
        echo json_encode($words);
        break;

}



?>