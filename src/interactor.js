/*
*   @type javascript
*   @name interactor.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    [
        'config',
        'src/util',
        'src/components/events',
        'src/components/status'
    ],
    function (
        config,
        util,
        events,
        status
    ) {
        'use strict';

        // declarations
        var $;

        // interactor constructor
        function Interactor() {
            util.log(
                "context:inter/init",
                "info",
                "Initialising Interactor..."
            );
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
                    "context:inter/init",
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

        // expand the currently active task or a specified task id
        Interactor.prototype.openTask = function (localId) {
            // get global id of task number
            var globalId = this.findGlobalId(localId || "");

            // get task if specified
            $("#task_" + globalId).trigger("click");

            // expand task details
            this.expandTaskDetails();
        };

        // close the currently expanded task
        Interactor.prototype.closeTask = function () {
            // shrink task details
            this.shrinkTaskDetails();
        };

        // expands the task details panel
        Interactor.prototype.expandTaskDetails = function () {
            // check current status
            if (status.interactor.taskDetailsExpanded) {
                return;
            }
            
            // show overlay
            $(".kbs-overlay").show();
            
            // expand
            $(".taskDetails").addClass("kbs-details-expand");
            
            // set status
            status.interactor.taskDetailsExpanded = true;
        };

        // shrinks the task details panel
        Interactor.prototype.shrinkTaskDetails = function () {
            if (!status.interactor.taskDetailsExpanded) {
                return;
            }
            
            // hide overlay
            $(".kbs-overlay").hide();
            
            // shrink
            $(".taskDetails").removeClass("kbs-details-expand");
            
            // set status
            status.interactor.taskDetailsExpanded = false;
        };

        // find a global task id from a local task id
        Interactor.prototype.findGlobalId = function (localId) {
            /*
            *   TODO:
            *   + Because this will only search currently displayed elements,
            *     it would be a good idea to perform an entire task search and
            *     check the elements that are returned for a global id
            */
            
            // declarations
            var child,
                parent,
                globalId;

            // get current task id if none passed
            if (typeof localId === "undefined") {
                localId = $(".local_task_id")[0].textContent;
            }

            util.log("debug", "Finding global id for task #" + localId);

            // get elements
            child = $(".task-id:contains(" + localId + ")");
            parent = child.parent();

            // if couldn't find a .task-id
            // try .taskID
            if (child.length < 1) {
                child = $(".taskID:contains(" + localId + ")");
                parent = child.parent().parent();
            }

            // if still nothing return false
            if (child.length < 1) {
                util.log("error", "Couldn't find task #" + localId);
                return false;
            }

            globalId = parent[0].id.replace("task_", "");

            util.log(
                "debug",
                parent,
                "Found parent element for task #" + localId +
                    " and got global id #" + globalId
            );

            return globalId;
        };

        // append elements to bugherd ui
        Interactor.prototype.applyElements = function () {
            util.log(
                "context:inter/init",
                "debug",
                "+ appending elements to bugherd"
            );

            // write an 'expand task' button to main nav
            $(".nav.main-nav").append(
                "<li><a href='javascript:void(0)'>Expand Task</a></li>"
            );
        };

        // apply new styling to bugherd ui
        Interactor.prototype.applyStyles = function () {
            util.log(
                "context:inter/init",
                "debug",
                "+ applying styles to bugherd"
            );

            // add a margin to user nav to accompany console controls
            $(".nav.user-menu").css("margin-right", "10px");
        };

        return Interactor;
    }
);