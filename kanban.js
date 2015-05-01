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
            main: window.KBS_BASE_URL + "src/main",
            test: window.KBS_BASE_URL + "src/test"
        }
    });
    
    // launch when window is loaded
    window.onload = function () {
        window.KBS_START_TIME = new Date().getTime();
        require(['main/init']);
    };
}(window));