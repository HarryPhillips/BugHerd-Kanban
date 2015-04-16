<?php
    // allow requests from bugherd
    header('Content-type: text/html');
    header('Access-Control-Allow-Origin: http://www.bugherd.com');

    if (isset($_POST) && !empty($_POST)) {
        // check for a token set by kanban
        if (!isset($_POST['kbstoken'])) {
            exit("403 - Forbidden");
        } else if ($_POST['kbstoken'] !== "Fw43Iueh87aw7") {
            exit("Invalid token");
        }
        
        // get type from post
        $type = $_POST['type'];
        
        $file = "buffer_";
        $file .= $_POST["date"];
        $file .= ".log";
        
        $buffer = $_POST["buffer"];
        
        echo "Response: ";
    } else {
        exit("ERROR: No POST data found!");
    }

    // write buffer to file
    if ($buffer !== "") {
        switch ($type) {
            case "log":
                write_log_file($file, $buffer);
                break;
            case "test":
                write_test_result($file, $buffer);
                break;
            default:
                echo "Error: Unknown buffer type!";
                break;
        }
    } else {
        echo "Buffer is empty";
    }

    // writes a log file to logs folder
    function write_log_file($log, $buffer) {
        echo "attempting to save log buffer to: 'logs/$log'\n";
        write_file("logs", $log, $buffer);
    }

    // write a test result file
    function write_test_result($test, $buffer) {
        write_file("../test/results", $test, $buffer);
    }
    
    // writes a buffer to a file
    function write_file($dir, $file, $buffer) {
        if (!is_dir($dir)) {
            echo "creating directory: $dir\n";
            mkdir($dir);
        }
        
        // what action are we committing
        $action = (file_exists("$dir/$file")) ? "Appended":"Saved";
        
        // write buffer to file
        file_put_contents("$dir/$file", $buffer, FILE_APPEND);
        
        echo "wrote a buffer to: '$dir/$file'\n";
    }
?>

