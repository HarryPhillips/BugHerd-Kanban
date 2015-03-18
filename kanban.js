/*
*   @type javascript
*   @name kanban.js
*   @auth Harry Phillips
*/

(function (window) {
    'use strict';
    
    // check if start time is already set
    if (!window.KBS_START_TIME) {
        window.KBS_START_TIME = new Date().getTime();
    }
    
    var require = window.require;
    
    require(['src/main']);
}(window));