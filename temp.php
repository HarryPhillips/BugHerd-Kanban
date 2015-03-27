<?php
    // allow requests from bugherd
    header('Content-type: text/html');
    header('Access-Control-Allow-Origin: http://www.bugherd.com');
    
    // respond
    sleep(2);
    $uri = 'http://'. $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    echo('This information has come from ' . $uri . '');
?>