/*
*   @type javascript
*   @name interactor.js
*   @copy Copyright 2015 Harry Phillips
*/

/*
*   TODO:
*   + Handle async task searches with callbacks to find_Id calls
*/

/*global define: true */

define(
    [
        'config',
        'src/util',
        'src/components/events',
        'src/components/status',
        'src/components/node',
        'src/ui/modal'
    ],
    function (
        config,
        util,
        events,
        status,
        Node,
        Modal
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
            //this.applyWrapper();
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
            
            // get global id
            this.findGlobalId(localId, function (task) {
                // once found - click the task
                task.trigger("click");
            });
        };

        // close the currently expanded task
        Interactor.prototype.closeTask = function () {
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
            
            // show overlay
            $(".kbs-overlay").fadeIn();
            
            // add expansion class
            $(".taskDetails").hide().addClass("kbs-details-expand");
            
            // show elements
            setTimeout(function () {
                $(".taskDetails, .kbs-details-close").fadeIn();
            
                // trigger a resize event
                // so BugHerd can set the content height
                $(window).trigger("resize");
            }, 250);
            
            // set status
            status.interactor.taskDetailsExpanded = true;
        };

        // shrinks the task details panel
        Interactor.prototype.shrinkTaskDetails = function () {
            var task = $(".taskDetails"),
                overlay = $(".kbs-overlay"),
                btn = $(".kbs-details-close");
            
            if (!status.interactor.taskDetailsExpanded) {
                return;
            }
            
            // hide elements
            task.removeClass("kbs-details-expand");
            btn.fadeOut();
            overlay.fadeOut();
            
            // set status
            status.interactor.taskDetailsExpanded = false;
        };
            
        // perform a task search
        Interactor.prototype.searchForTask = function (localId, callback) {
            var search = $(".VS-search-inner input"),
                event = $.Event("keydown"),
                clear = $("div.VS-icon:nth-child(4)"),
                facet,
                result;
            
            // down arrow
            event.keyCode = 40;
            
            // focus and nav to id
            search
                .focus()
                .trigger(event) // created
                .trigger(event) // filter
                .trigger(event); // id - bingo!
            
            // return key
            event.keyCode = 13;
            
            // press enter key to select id
            search.focus().trigger(event);
            
            // enter localId into input
            facet = $(".search_facet_input");
            facet
                .val(localId)
                .trigger("keydown");

            setTimeout(function () {
                // press enter
                facet.trigger(event);
            
                setTimeout(function () {
                    // callback with task
                    callback($(".task"));
                    
                    // unfocus from search
                    document.activeElement.blur();
                    
                    setTimeout(function () {
                        // clear search field
                        $("div.VS-icon:nth-child(4)").trigger("click");
                    }, 1000);
                }, 500);
            });
        };

        // find a global task id from a local task id
        Interactor.prototype.findGlobalId = function (localId, callback) {
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
            
            // find the right task
            setone.each(check);
            
            // check set two if no child found
            if (!child) {
                settwo.each(check);
            }

            // if still nothing - perform a task search (async!)
            if (typeof child === "undefined") {
                if (typeof callback === "undefined") {
                    util.log(
                        "error",
                        "Couldn't find global id for #" + localId +
                            " Provide a callback function to allow " +
                            "async task searches!"
                    );
                }
                
                // async search for task - calls callback with result
                util.log("debug", "Searching for task #" + localId + "...");
                this.searchForTask(localId, function (task) {
                    if (self.findLocalIdFromTask(task) === localId) {
                        callback(task);
                    } else {
                        util.log("error", "Couldn't find global id for task " +
                                "#" + localId);
                    }
                });
                
                return;
            }
            
            // if found without asyn search - get and return
            parent = child.closest(".task");
            globalId = parent[0].id.replace("task_", "");

            return globalId;
        };
            
        // find a local task id from a global task id
        Interactor.prototype.findLocalId = function (globalId) {
            $("#task_" + globalId).find(".task-id, .taskID").text();
        };
            
            
        // find a global task id from task element
        Interactor.prototype.findGlobalIdFromTask = function (task) {
            var parent = task.closest(".task"),
                globalId = parent[0].id.replace("task_", "");
            
            return globalId;
        };
            
        // find a local task id from task element
        Interactor.prototype.findLocalIdFromTask = function (task) {
            var parent = task.closest(".task"),
                localId = task.find(".task-id, .taskID").text();
            
            return localId;
        };
            
        // wrap bugherd content in a kbs-wrapper element
        Interactor.prototype.applyWrapper = function () {
            // wait until main content is ready
            $(".pane-wrap").ready(function () {
                util.log(
                    "context:inter/init",
                    "+ wrapping bugherd application"
                );

                // wrap application wrapper in kbs-wrapper
                $(".app-wrap").wrap("<div class='kbs-wrapper'></div>");
            });
        };

        // append elements to bugherd ui
        Interactor.prototype.applyElements = function () {
            // declarations
            var taskExpander,
                taskContractor,
                taskSearch;
            
            util.log(
                "context:inter/init",
                "+ appending elements to bugherd"
            );

            // task expander list element
            taskExpander = new Node("li");
            
            // task expander anchor element
            taskExpander.createChild("a")
                .text("Search Task")
                .on("click", function (event) {
                    taskSearch = new Modal("input", {
                        init: true,
                        title: "Find a task",
                        message: "Enter the ID of the task you want to find:",
                        input: "number",
                        continueText: "Go",
                        proceed: function (localId) {
                            self.openTask(localId);
                            taskSearch.destroy();
                        }
                    });
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
                "+ applying handlers to bugherd"
            );
            
            // delegate clicks on app wrapper
            $(".app-wrap").on("click", function (event) {
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
                "+ applying styles to bugherd"
            );

            // add a margin to user nav to accompany console controls
            $(".nav.user-menu").css("margin-right", "10px");
        };

        return Interactor;
    }
);