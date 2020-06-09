<?php

$ds = DIRECTORY_SEPARATOR;
$base_dir = realpath(dirname(__FILE__)  . $ds . '..'. $ds . '..') . $ds;

require_once("{$base_dir}config.php");

try {
    $DBH = new PDO("mysql:host=$host;port=8889;dbname=$database",  $username, $password);

    $DBH -> setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

} catch (PDOException $e) {
    echo $e->getMessage();
}

?>