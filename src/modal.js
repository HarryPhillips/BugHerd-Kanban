/*
*   @type javascript
*   @name modal.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(['./gui'], function (GUI) {
    'use strict';
    
    function Modal() {
        this.gui = new GUI();
    }
    
    return Modal;
});