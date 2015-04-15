/*
*   @type javascript
*   @name kanban.js
*   @copy Copyright 2015 Harry Phillips
*/

// check if globals are set
if (!window.KBS_GLOBAL_SET) {
    // set globals
    window.KBS_GLOBAL_SET = true;
    window.KBS_START_TIME = new Date().getTime();
    window.KBS_DELTA_TIME = "";
    window.KBS_SERVER = "http://localhost";
    window.KBS_BASE_URL = window.KBS_SERVER + "/GitHub/Kanban/";
}

(function (window) {
    'use strict';
    
    var require = window.require;
    
    require.config({
        paths: {
            src: window.KBS_BASE_URL + "src",
            test: window.KBS_BASE_URL + "test"
        }
    });
    
    // launch when doc is ready
    if (document.readyState === "complete") {
        window.KBS_START_TIME = new Date().getTime();
        require(['src/main']);
    } else {
        document.onreadystatechange = function () {
            if (this.readyState === "complete") {
                window.KBS_START_TIME = new Date().getTime();
                require(['src/main']);
            }
        };
    }
}(window));