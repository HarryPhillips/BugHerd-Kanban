/*
*   @type javascript
*   @name kanban.js
*   @copy Copyright 2015 Harry Phillips
*/

// check if globals are set
if (!window.KBS_GLOBAL_SET) {
    var KBS_GLOBAL_SET = true,
        
        KBS_START_TIME = new Date().getTime(),
        KBS_END_TIME,

        KBS_BASE_URL = "http://localhost/GitHub/",
        KBS_SRC_DIR = "kanban/";
}

(function (window) {
    'use strict';
    
    var require = window.require;
    
    require(['src/main']);
}(window));