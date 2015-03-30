<?php
    // allow requests from bugherd
    header('Content-type: text/html');
    header('Access-Control-Allow-Origin: http://www.bugherd.com');
    
    if (isset($_POST) && !empty($_POST)) {
        $file = "buffer_";
        $file .= $_POST["date"];
        $file .= ".log";
        
        $buffer = $_POST["buffer"];
    } else {
        exit("ERROR: No POST data found!");
    }

    // write buffer to file
    if ($buffer !== "") {
        write_log($file, $buffer);
    } else {
        echo "Buffer is empty";
    }

    // writes a log file to logs folder
    function write_log($filename, $buffer) {
        // check for logs dir
        if (!is_dir("logs")) {
            echo "Creating logs directory\r\n";
            mkdir("logs");
        }
        
        // write buffer to file
        file_put_contents("logs/".$filename, $buffer, FILE_APPEND);
        
        echo "Saved log buffer to: '".$filename."'\r\n";
    }
?>