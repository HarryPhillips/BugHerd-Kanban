<?php
    // allow requests from bugherd
    header('Content-type: text/html');
    header('Access-Control-Allow-Origin: http://www.bugherd.com');
    
    if (isset($_POST)) {
        echo "POST: ".print_r($_POST);
    } else if(isset($_GET)) {
        echo "GET: ".print_r($_GET);
    }

    // respond
    $uri = 'http://'. $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    echo('This information has come from ' . $uri . '');
?>