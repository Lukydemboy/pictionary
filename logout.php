<?php

session_start();

session_unset();

print_r($_SESSION);

header('location:index.php?msg=loggout');