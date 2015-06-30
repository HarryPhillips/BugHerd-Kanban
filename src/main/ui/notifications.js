/*
*   @type javascript
*   @name notifications.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */
define(
    [
        "config",
        "main/components/util",
        "main/components/repository"
    ],
    function (config, util, Repository) {
        "use strict";
        
        var inited = false,
            repo = new Repository();
        
        // notifications class
        function Notifications() {
            util.log(
                "context:inter/notifs",
                "info",
                "Initialising Notifications..."
            );
            
            inited = true;
            this.notifs = [];
        }
        
        // initialise
        Notifications.prototype.init = function () {
            if (inited) {
                return;
            }

            // apply elements and styling
            this.applyElements();
            this.applyHandlers();
            this.applyStyles();
            this.applyContext();
            this.applyHash();

            inited = true;
        };
        
        // follow a task
        Notifications.prototype.follow = function (id) {};
        
        // unfollow a task
        Notifications.prototype.unfollow = function (id) {};
        
        // add a notification badge to a task
        Notifications.prototype.setupNotifsForTask = function (id) {};
        
        // notification element application
        Notifications.prototype.applyElements = function () {};
        
        // notifications handler application
        Notifications.prototype.applyHandlers = function () {};
        
        // notifications logging context
        Notifications.prototype.applyContext = function () {
            util.log(
                "context:inter/notifs",
                "+ applying notifications context"
            );
            util.log(
                "context:interactor",
                "buffer",
                "log-buffer: NOTIFICATIONS"
            );
        };
        
        return Notifications;
    }
);
