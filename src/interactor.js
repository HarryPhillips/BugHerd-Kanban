/*
*   @type javascript
*   @name interactor.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(function (require) {
    'use strict';
    
    // declarations
    var
        util = require('src/util'),
    
        // jquery pointer
        $;
    
    // interactor constructor
    function Interactor() {
        this.init();
    }
    
    // initialise the interactor
    Interactor.prototype.init = function () {
        // check jquery
        if (typeof window.jQuery !== "undefined") {
            // get
            $ = window.jQuery;
        } else {
            // no jquery, log error
            util.log(
                "error",
                "Interactor could not initialise, jQuery not found!"
            );
            
            // and exit interactor
            return;
        }
        
        // apply elements and styling
        this.applyElements();
        this.applyStyles();
    };
    
    // append elements to bugherd ui
    Interactor.prototype.applyElements = function () {
        // write an 'expand task' button to main nav
        //$(".nav.main-nav").append("<li>Expand Task</li>");
        $(".nav.main-nav").append(
            "<li><a href='javascript:void(0)'>Expand Task</a></li>"
        );
    };
    
    // apply new styling to bugherd ui
    Interactor.prototype.applyStyles = function () {
        // add a margin to user nav to accompany console controls
        $(".nav.user-menu").css("margin-right", "10px");
    };
    
    return Interactor;
});