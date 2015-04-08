/*
*   @type javascript
*   @name kanban.js
*   @copy Copyright 2015 Harry Phillips
*/

// check if globals are set
if (!window.KBS_GLOBAL_SET) {
    var KBS_GLOBAL_SET = true,
        
        KBS_START_TIME = new Date().getTime(),
        KBS_DELTA_TIME,

        KBS_BASE_URL = "http://localhost/GitHub/";
}

(function (window) {
    'use strict';
    
    var require = window.require;
    
    require.config({
        paths: {
            src: KBS_BASE_URL + "src",
            test: KBS_BASE_URL + "test"
        }
    });
    
    require(['src/main']);
}(window));