<?php

    // return request data
    if (isset(file_get_contents("php://input"))) {
        $data = json_decode(file_get_contents("php://input"));
        echo $data;
    } else {
        echo "GET: ".print_r($_GET);
        echo "POST: ".print_r($_POST);
    }

?>