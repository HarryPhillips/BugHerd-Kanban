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
            this.applyContext();

            inited = true;
        };
        
        // follow a task
        Notifications.prototype.follow = function (id) {
            // attach an on update handler via bugherd api
            // ->
            
            // on update - update badges on task and notif centre
            // ->
        };
        
        // unfollow a task
        Notifications.prototype.unfollow = function (id) {};
        
        // add a notification badge to a task
        Notifications.prototype.setupNotifsForTask = function (id) {};
        
        // notification element application
        Notifications.prototype.applyElements = function () {
            // add a notification centre
            // ->
            
            // add a badge which tells the user how many tasks
            // are in need of attention
            // ->
            
            // add a follow/unfollow button to all tasks
            // ->
        };
        
        // notifications handler application
        Notifications.prototype.applyHandlers = function () {
            // on clicking of a follow/unfollow button
            // ->
        };
        
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
