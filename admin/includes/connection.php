<?php

try {

    $host = 'localhost';
    $database = 'pictionary';
    $username = 'pictionary';
    $password = 'godsword1';

    $DBH = new PDO("mysql:host=$host;port=8889;dbname=$database",  $username, $password);

    $DBH -> setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

} catch (PDOException $e) {
    echo $e->getMessage();
}

?>