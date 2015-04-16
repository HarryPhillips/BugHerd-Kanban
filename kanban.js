/*
*   @type javascript
*   @name kanban.js
*   @copy Copyright 2015 Harry Phillips
*/

(function (window) {
    'use strict';
    
    var require = window.require,
        deposit = document.getElementById("kbs-deposit").classList;
    
    // process deposited values
    window.KBS_GLOBAL_SET = (deposit[0] === "true") ? true : false;
    window.KBS_START_TIME = deposit[1];
    window.KBS_DELTA_TIME = "";
    window.KBS_BASE_URL = deposit[2];
    
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