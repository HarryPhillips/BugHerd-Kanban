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
        'src/components/status',
        'src/components/node'
    ],
    function (
        config,
        util,
        events,
        status,
        Node
    ) {
        'use strict';

        // declarations
        var $,
            self,
            inited = false;

        // interactor constructor
        function Interactor() {
            util.log(
                "context:inter/init",
                "info",
                "Initialising Interactor..."
            );
            
            // set pointer
            self = this;
            
            // initialise
            this.init();
        }

        // initialise the interactor
        Interactor.prototype.init = function () {
            if (inited) {
                return;
            }
            
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
            this.applyWrapper();
            this.applyElements();
            this.applyHandlers();
            this.applyStyles();
            
            inited = true;
        };
            
        // returns if an object is or is apart of a task element
        Interactor.prototype.isTask = function (element) {
            // get jquery object
            if (!element instanceof $) {
                element = $(element);
            }
            
            element = element.closest("[id^=task_]");
            
            return (element.length) ? element : false;
        };
        
        // get the wrapper task element from a component
        Interactor.prototype.getTaskFromComponent = function (component) {
            return component.closest("[id^=task_]");
        };

        // expand the currently active task or a specified task id
        Interactor.prototype.openTask = function (localId) {
            if (typeof localId === "undefined") {
                this.expandTaskDetails();
                return;
            }
            
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
            if (!$(".panelDetail").is(":visible")) {
                return;
            }
            
            // check current status
            if (status.interactor.taskDetailsExpanded) {
                return;
            }
            
            // show elements
            $(".kbs-overlay").fadeIn();
            $(".kbs-details-close").fadeIn();
            
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
            
            // hide elements
            $(".kbs-overlay").fadeOut();
            $(".kbs-details-close").fadeOut();
            
            // shrink
            $(".taskDetails").removeClass("kbs-details-expand");
            
            // set status
            status.interactor.taskDetailsExpanded = false;
        };

        // find a global task id from a local task id
        Interactor.prototype.findGlobalId = function (localId) {
            /*
                TODO:
                - Need to perform a task search if not found, so that
                tasks not currently rendered can be found
            */
            
            // declarations
            var setone = $(".task-id"), settwo = $(".taskID"),
                child, parent,
                globalId,
                check = function (index) {
                    if ($(this)[0].textContent === localId.toString()) {
                        child = $(this);
                    }
                };

            // get current task id if none passed
            if (typeof localId === "undefined") {
                localId = $(".local_task_id")[0].textContent;
            }

            util.log("debug", "Finding global id for task #" + localId);

            // get elements
            setone = $(".task-id");
            
            // find the right task
            setone.each(check);
            
            // check set two if no child found
            if (!child) {
                settwo.each(check);
            }
            
            // check if child was found
            if (typeof child === "undefined") {
                throw new Error("No task found with id: '" +
                                localId +
                                "'!");
            }
            
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
            
        // find a local task id from a global task id
        Interactor.prototype.findLocalId = function (globalId) {
            var element = $("#task_" + globalId);
            console.log(element);
        };
            
        // wrap bugherd content in a kbs-wrapper element
        Interactor.prototype.applyWrapper = function () {
            util.log(
                "context:inter/init",
                "okay",
                "+ wrapping bugherd application"
            );
            
            // wrap application wrapper in kbs-wrapper
            $(".app-wrap").wrap("<div class='kbs-wrapper'></div>");
        };

        // append elements to bugherd ui
        Interactor.prototype.applyElements = function () {
            // declarations
            var taskExpander,
                taskContractor;
            
            util.log(
                "context:inter/init",
                "okay",
                "+ appending elements to bugherd"
            );

            // task expander list element
            taskExpander = new Node("li");
            
            // task expander anchor element
            taskExpander.createChild("a")
                .text("Expand Task")
                .on("click", function (event) {
                    self.openTask();
                });
            
            // task contractor/close button
            taskContractor = new Node("div", "kbs-details-close");
            taskContractor.createChild("i", "fa fa-times");
            taskContractor.on("click", function (event) {
                self.closeTask();
            });
            
            // write
            taskExpander.writeTo($(".nav.main-nav")[0]);
            taskContractor.writeTo($("body")[0]);
        };
            
        // apply event handlers
        Interactor.prototype.applyHandlers = function () {
            util.log(
                "context:inter/init",
                "okay",
                "+ applying handlers to bugherd"
            );
            
            // delegate clicks on kbs wrapper
            $(".kbs-wrapper").on("click", function (event) {
                var target = $(event.target),
                    task = self.isTask(target);
                if (task) {
                    self.openTask();
                }
            });
        };

        // apply new styling to bugherd ui
        Interactor.prototype.applyStyles = function () {
            util.log(
                "context:inter/init",
                "okay",
                "+ applying styles to bugherd"
            );

            // add a margin to user nav to accompany console controls
            $(".nav.user-menu").css("margin-right", "10px");
        };

        return Interactor;
    }
);