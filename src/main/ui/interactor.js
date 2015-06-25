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
        'main/components/repository',
        'main/components/configurator',
        'main/ui/node',
        'main/ui/modal'
    ],
    function (
        config,
        util,
        events,
        status,
        Repository,
        Configurator,
        Node,
        Modal
    ) {
        'use strict';

        // declarations
        var $,
            self,
            inited = false,
            configurator = new Configurator(),
            repo = new Repository(),
            bugherd,
            gui;

        // interactor constructor
        function Interactor() {
            util.log(
                "context:inter/init",
                "info",
                "Initialising Interactor..."
            );
            
            // set references
            self = this;
            gui = repo.get("gui");
            
            this.activeTask = null;
            
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

        // expand the currently active task or a specified task id
        Interactor.prototype.openTask = function (localId) {
            util.log(
                "context:interactor",
                "Opening task #" + localId + "..."
            );
            
            this.activeTask = localId;
            
            if (typeof localId === "undefined") {
                this.expandTaskDetails();
                return;
            }
            
            // get global id
            this.findGlobalId(localId, function (task) {
                // once found - click the task
                setTimeout(function () {
                    task.trigger("click");
                }, 500);
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
            
            this.activeTask = this.findLocalIdFromDetails();
            util.log("context:interactor", "active task: #" + this.activeTask);
            
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
                btn = $(".kbs-details-closed");
            
            if (!status.interactor.taskDetailsExpanded) {
                return;
            }
            
            this.activeTask = null;
            
            // set status
            status.interactor.taskDetailsExpanded = false;
            
            // hide elements
            task.removeClass("kbs-details-expand");
            btn.fadeOut();
            gui.hideOverlay();
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
            facet.val(localId)
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
                        
                        errModal = new Modal("task-not-found", {
                            init: true,
                            id: localId,
                            confirm: function () {
                                // close the err modal
                                errModal.close();
                                
                                // re-open search task
                                errModal
                                    .getController()
                                    .getModalByName("task-search")
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
            return $("#task_" + globalId).find(".task-id, .taskID").text();
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
            
        // find a local task id from task details
        Interactor.prototype.findLocalIdFromDetails = function () {
            var parent = $(".taskDetails"),
                localId = parent.find(".local_task_id");
            
            return localId.text() || localId.val();
        };
        
        // get the task element from an inner component
        // note: only applies to board tasks
        Interactor.prototype.findTaskFromComponent = function (component) {
            var task = component.closest("[id^=task_]");
            
            // if not found - return false
            if (!task.length) {
                return false;
            }
            
            return this.findLocalIdFromTask(task);
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
            
        // view a screenshot in a modal
        Interactor.prototype.viewScreenshot = function (link) {
            var bugherd = repo.get("bugherd"),
                size = {},
                winsize,
                modal,
                id;
            
            // get the task id from detail panel
            id = parseInt(self.findLocalIdFromDetails(), 10);
            
            util.log(
                "context:interactor",
                "debug",
                "Viewing screenshot for task #" + id
            );
            
            modal = new Modal("view-screenshot", {
                viewParams: {
                    id: id,
                    title: (link[0]
                            .textContent
                            .indexOf("screenshot") !== -1
                           ) ? "Screenshot" : "Fix Result",
                    url: link[0].href,
                    width: size.x,
                    height: size.y
                }
            });
        };
            
        // hide all tasks with the following tag(s)
        Interactor.prototype.onTasksWithTag = function (method, tag) {
            var bugherd = repo.get("bugherd"),
                tasks = bugherd.getTasks(),
                list = bugherd.tasks.findAllWithTag(tag),
                len = list.length,
                i = 0,
                x = 0,
                disp = (method === "show") ? "block" : "none",
                e;
            
            // return list of tasks with tag
            if (method === "list") {
                // return task id's
                for (x; x < len; x += 1) {
                    list[x] = list[x].attributes.local_task_id;
                }
                
                return new Modal("view-object", {
                    viewParams: {
                        message: "Filter Results:",
                        object: list
                    }
                });
            }
            
            for (i; i < len; i += 1) {
                e = document.getElementById("task_" + list[i].id);
                
                if (e) {
                    e.style.display = disp;
                }
            }
        };
            
        // hide all tasks with the following client data
        Interactor.prototype.onTasksWithClientData = function (method, key, value) {
            var bugherd = repo.get("bugherd"),
                list = bugherd.tasks.findAllWithClientData(key, value),
                len = list.length,
                i = 0,
                x = 0,
                disp = (method === "show") ? "block" : "none",
                e;
            
            // return list of tasks with data
            if (method === "list") {
                // return task id's
                for (x; x < len; x += 1) {
                    list[x] = list[x].attributes.local_task_id;
                }
                
                return new Modal("view-object", {
                    viewParams: {
                        message: "Filter Results:",
                        object: list
                    }
                });
            }
            
            for (i; i < len; i += 1) {
                e = document.getElementById("task_" + list[i].id);
                
                if (e) {
                    e.style.display = disp;
                }
            }
        };
            
        // hide all tasks with the following meta data
        Interactor.prototype.onTasksWithMetaData = function (method, key, value) {
            var bugherd = repo.get("bugherd"),
                list = bugherd.tasks.findAllWithMeta(key, value),
                len = list.length,
                i = 0,
                x = 0,
                disp = (method === "show") ? "block" : "none",
                e;
            
            // return list of tasks with data
            if (method === "list") {
                // return task id's
                for (x; x < list.length; x += 1) {
                    list[x] = list[x].attributes.local_task_id;
                }
                
                return new Modal("view-object", {
                    viewParams: {
                        message: "Filter Results:",
                        object: list
                    }
                });
            }
            
            for (i; i < len; i += 1) {
                e = document.getElementById("task_" + list[i].id);
                
                if (e) {
                    e.style.display = disp;
                }
            }
        };
            
        // hides all tasks
        Interactor.prototype.hideAllTasks = function () {
            var bugherd = repo.get("bugherd"),
                tasks = bugherd.getTasks(),
                len = tasks.length,
                i = 0,
                e;
            
            // hide all tasks
            for (i; i < len; i += 1) {
                e = document.getElementById("task_" + tasks[i].id);
                
                if (e) {
                    e.style.display = "none";
                }
            }
        };
        
        // shows all tasks
        Interactor.prototype.showAllTasks = function () {
            var bugherd = repo.get("bugherd"),
                tasks = bugherd.getTasks(),
                len = tasks.length,
                i = 0,
                e;
            
            // hide all tasks
            for (i; i < len; i += 1) {
                e = document.getElementById("task_" + tasks[i].id);
                
                if (e) {
                    e.style.display = "block";
                }
            }
        };
            
        // reset any task filters
        Interactor.prototype.resetAllFilters = function () {
            this.showAllTasks();
            $("div.head-actions:nth-child(1) > " +
                "ul:nth-child(1) > li:nth-child(1) > " +
                "ul:nth-child(3) > li:nth-child(1) > " +
                "a:nth-child(1)").trigger("click");
            
            this.showAllTasks();
        };
        
        // return current hash
        Interactor.prototype.getHash = function () {
            return window.location.hash;
        };
            
        // apply hash command
        Interactor.prototype.parseHash = function () {
            var hash = this.getHash(),
                href = window.location.href,
                taskId;
            
            util.log(
                "context:hash",
                "parsing new hash: " + hash
            );

            // open task
            if (hash === "#open") {
                // get task id
                if (href.indexOf("tasks/") !== -1) {
                    taskId = parseInt(href.split("tasks/")[1], 10);
                } else {
                    taskId = parseInt(hash.replace("#open", ""), 10);
                }
            }
            
            // settings
            if (hash === "#settings") {
                configurator.launchModal();
                location.hash = "";
            }

            if (taskId) {
                this.openTask(taskId);
            }
        };

        // append elements to bugherd ui
        Interactor.prototype.applyElements = function () {
            // declarations
            var search,
                filter,
                detailClose,
                taskSearch,
                taskFilter,
                nav;
            
            util.log(
                "context:inter/init",
                "+ appending elements to bugherd"
            );

            // task search list element
            search = new Node("li");
            
            // task search anchor element
            search.createChild("a")
                .text("Search Task")
                .on("click", function (event) {
                    taskSearch = new Modal("task-search", {
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
            
           // task filter list element
            filter = new Node("li");
            
            // task filter anchor element
            filter.createChild("a")
                .text("Filter")
                .on("click", function (event) {
                    taskFilter = new Modal("task-filter");
                });
            
            // task details close button
            detailClose = new Node("div", "kbs-details-closed");
            detailClose.createChild("i", "fa fa-times");
            detailClose.on("click", function (event) {
                self.closeTask();
            });
            
            // write
            nav = $(".nav.main-nav")[0];
            search.writeTo(nav);
            filter.writeTo(nav);
            detailClose.writeTo($("body")[0]);
        };
            
        // apply event handlers
        Interactor.prototype.applyHandlers = function () {
            var appwrap = new Node(".app-wrap"),
                body = new Node(document.body),
                kanban = new Node("#kanbanBoard"),
                move,
                frame,
                fc;
            
            util.log(
                "context:inter/init",
                "+ applying handlers to bugherd"
            );
            
            // delegate clicks on app wrapper
            appwrap.on("click", function (event) {
                var target = $(event.target),
                    task = self.isTask(target);
                
                // capture task clicks
                if (task && config.interactor.expandOnclick) {
                    self.expandTaskDetails();
                    return;
                }
                
                // capture screenshot clicks
                if (target.hasClass("attachLink")) {
                    // view screenshots only
                    if (target.text().match(/(fix-result)|(view_screenshot)|(\.png)|(\.jpg)/)) {
                        event.preventDefault();
                        self.viewScreenshot(target);
                    }
                }
            });
            
            // on document mouse move - apply parallax to wallpaper
            // if there is one (experimental)
            if (config.gui.wallpaper && config.gui.parallax.enabled) {
                move = false;
                frame = setInterval(function () {
                    move = (move) ? false : true;
                }, 32);
                
                body.on("mousemove", function (event) {
                    fc = config.gui.parallax.factor;
                    
                    if (move) {
                        var deltaX = -(event.pageX / fc),
                            deltaY = -(event.pageY / fc);

                        kanban.css(
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
                "buffer",
                "log-buffer: INTERACTOR"
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
            
            util.log("context:hash", "buffer", "log-buffer: HASH");
            
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