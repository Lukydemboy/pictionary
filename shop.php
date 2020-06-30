<?php
session_start();
include_once 'admin/includes/connection.php';


?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Shop</title>
    <link rel="stylesheet" href="css/style.css">
    <link href="https://fonts.googleapis.com/css?family=Merriweather|Source+Sans+Pro:300,400,600,700,900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/nav.css">
</head>
<body>
    <?php
        include_once 'includes/nav.php';
    ?>

    <div class="container">
        <h1 class="profile-title">Shop</h1>
    </div>

    <script src="admin/js/notifications.js"></script>    
    <script src="admin/js/friendsList.js"></script>
</body>
</html>