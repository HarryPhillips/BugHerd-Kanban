/*
*   @type javascript
*   @name interactor.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true, MutationObserver: true */

define(
    [
        'config',
        'main/components/util',
        'main/components/events',
        'main/components/status',
        'main/components/node',
        'main/ui/modal'
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
            inited = false,
            gui;

        // interactor constructor
        function Interactor(instance) {
            util.log(
                "context:inter/init",
                "info",
                "Initialising Interactor..."
            );
            
            // set references
            self = this;
            gui = instance;
            
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
            this.applyElements();
            this.applyHandlers();
            this.applyStyles();
            this.applyContext();
            this.applyHash();
            
            // begin observing
            this.observe();
            
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
            util.log(
                "context:interactor",
                "Opening task #" + localId + "..."
            );
            
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
            $(".kbs-overlay").show();
            
            // add expansion class
            $(".taskDetails").hide().addClass("kbs-details-expand");
            
            // show elements
            setTimeout(function () {
                $(".taskDetails, .kbs-details-closed").fadeIn();
            
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
                btn = $(".kbs-details-closed");
            
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
            
            util.log(
                "context:interactor",
                "Searching for task #" + localId
            );
            
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
                        document.activeElement.blur();
                    }, 1000);
                }, 500);
            });
        };

        // find a global task id from a local task id
        Interactor.prototype.findGlobalId = function (localId, callback) {
            // declarations
            var tasks = $(".task-id, .taskID"),
                child,
                parent,
                globalId,
                errModal,
                errMsg,
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
            tasks.each(check);

            // if nothing found - perform a task search (async!)
            if (typeof child === "undefined") {
                if (typeof callback === "undefined") {
                    util.log(
                        "context:interactor",
                        "error",
                        "Couldn't find global id for task #" + localId +
                            ". Provide a callback function to allow " +
                            "async task searches!"
                    );
                    return;
                }
                
                // async search for task - calls callback with result
                this.searchForTask(localId, function (task) {
                    if (self.findLocalIdFromTask(task) === localId) {
                        callback(task);
                    } else {
                        errMsg = "Couldn't find task #" + localId;
                        
                        util.log(
                            "context:interactor",
                            "error",
                            errMsg
                        );
                        
                        errModal = new Modal("taskNotFound", {
                            init: true,
                            id: localId,
                            confirm: function () {
                                // close the err modal
                                errModal.close();
                                
                                // re-open search task
                                errModal
                                    .getController()
                                    .getModalByName("searchTask")
                                    .open();
                            },
                            cancel: function () {
                                errModal.close();
                            }
                        });
                    }
                });
                
                return;
            }
            
            // if found without asyn search - get and return
            parent = child.closest(".task");
            globalId = parent[0].id.replace("task_", "");

            // run callback with task/parent if defined
            if (callback) {
                callback(parent);
            }
            
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
            
        // find/filter tasks by meta data
        Interactor.prototype.findTaskFromMetadata = function (title, content) {
            
        };
            
        // return all tasks for the current project in all boards
        Interactor.prototype.getAllTasks = function () {
            var tasks = [];
            
            return tasks;
        };
            
        // navigate the ui to a specified task board
        Interactor.prototype.navigateTo = function (board) {
            var nav = $("#nav-" + board.toLowerCase());
            
            // make sure is valid view
            if (nav.length) {
                nav.trigger("click");
            } else {
                util.log(
                    "context:interactor",
                    "error",
                    "Failed to navigate to: '" + board + "'"
                );
            }
        };
            
        // return current hash
        Interactor.prototype.getHash = function () {
            return window.location.hash;
        };
            
        // apply hash command
        Interactor.prototype.parseHash = function () {
            var hash = this.getHash(),
                href = window.location.href,
                hashId;
            
            util.log(
                "context:hash",
                "parsing new hash: " + hash
            );

            // prefixed
            if (hash === "#open") {
                // check if prefixed
                if (href.indexOf("tasks/") !== -1) {
                    hashId = parseInt(href.split("tasks/")[1], 10);

                    // open
                    if (hashId) {
                        this.openTask(hashId);
                    }
                }
            }

            // suffixed
            hashId = parseInt(hash.replace("#open", ""), 10);

            if (hashId) {
                this.openTask(hashId);
            }
        };
            
        // mutation observer, listen for creation of tasks
        Interactor.prototype.observe = function () {
            util.log("context:inter/init", "+ observing...");
            
            var
                // observer instance
                observer = new MutationObserver(function (mutations) {
                    mutations.forEach(function (mutation) {
                        util.log(
                            "context:interactor",
                            mutation
                        );
                    });
                }),
                
                // observer config
                observerSettings = {
                    attributes: true,
                    childList: true,
                    characterData: true
                },
                
                // target element
                target = document.querySelector(".task");
            
            // begin observing
            if (config.interactor.observe) {
                observer.observe(target, observerSettings);
            }
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
                    taskSearch = new Modal("searchTask", {
                        init: true,
                        proceed: function (localId) {
                            if (!localId) {
                                // return if no id passed
                                return;
                            }
                            
                            taskSearch.close();
                            self.openTask(localId);
                        }
                    });
                });
            
            // task contractor/close button
            taskContractor = new Node("div", "kbs-details-closed");
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
                    self.expandTaskDetails();
                }
            });
            
            // on document mouse move - apply parallax to wallpaper
            // if there is one
            if (config.gui.wallpaper && config.gui.parallax) {
                var move = false,
                    frame = setInterval(function () {
                        move = (move) ? false : true;
                    }, 32);
                
                $("body").on("mousemove", function (event) {
                    if (move) {
                        var deltaX = -(event.pageX / 10),
                            deltaY = -(event.pageY / 10);

                        $("#kanbanBoard").css(
                            "background-position",
                            deltaX + "px " + deltaY + "px"
                        );
                    }
                });
            }
        };

        // apply new styling to bugherd ui
        Interactor.prototype.applyStyles = function () {
            util.log(
                "context:inter/init",
                "+ applying styles to bugherd"
            );
            
            // apply wallpaper
            $(".pane-center .pane-content").css("background-image", config.gui.wallpaper);

            // add a margin to user nav to accompany console controls
            $(".nav.user-menu").css("margin-right", "10px");
            
            // overhaul theme specifics
            if (gui.getThemeName().indexOf("DOS") !== -1) {
                // change VS search icon to use fa
                $(".VS-icon-search").append("<i class=\"fa fa-search\"></i>");
                $(".VS-icon-search").css("top", "8px");

                // change VS cancel icon to use fa
                $(".VS-icon-cancel").append("<i class=\"fa fa-times\"></i>");
                $(".VS-icon-cancel").css("top", "8px");
            }
        };
            
        // apply interactor logging context / output
        Interactor.prototype.applyContext = function () {
            util.log(
                "context:inter/init",
                "+ applying interactor context"
            );
            util.log(
                "context:interactor",
                "info",
                "Interactor log output..."
            );
        };
            
        // apply hash lookup and event listeners
        Interactor.prototype.applyHash = function () {
            util.log(
                "context:inter/init",
                "+ applying hash parser"
            );
            
            var hash,
                href = window.location.href,
                hashId;
            
            util.log("context:hash", "info", "Hash events...");
            
            // open task if hash is prefixed
            // or suffixed with a task
            if (this.getHash()) {
                setTimeout(function () {
                    self.parseHash();
                }, 500);
            }
            
            // listening for hash events
            $(window).on("hashchange", function (event) {
                util.log(
                    "context:hash",
                    "hash changed: " + self.getHash()
                );
                
                self.parseHash();
            });
            
            if (this.getHash()) {
                util.log("context:hash", "found hash: " + this.getHash());
            }
        };

        return Interactor;
    }
);