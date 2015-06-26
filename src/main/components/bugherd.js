/*
*   @type javascript
*   @name bugherd.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

/*jslint nomen: true*/

define(
    [
        'config',
        'main/components/util',
        'main/components/cache',
        'main/components/status',
        'main/components/repository',
        'main/ui/node'
    ],
    function (config, util, cache, status, Repository, Node) {
        'use strict';
        
        // bugherd's global api
        var repo = new Repository(),
            bh = window.bugherd,
            $ = window.jQuery,
            interactor,
            instance,
            gui;
        
        /* Class Definitions
        ------------------------------------------*/
        // task api controller
        function TaskController() {
            this.api = bh.application.tasksCollection;
            this.baseApi = instance;
            this.setSeverityStyle = this.rSetSeverityStyle.bind(this);
            this.setAllSeverityStyles = this.rSetAllSeverityStyles.bind(this);
        }
        
        // bugherd api wrapper
        function BugHerd() {
            // return the instance if already exists
            if (instance) {
                return instance;
            }
            
            // set instances
            instance = this;
            interactor = interactor || repo.get("interactor");
            gui = gui || repo.get("gui");
            
            this.api = bh;
            this.tasks = new TaskController();
            this.init();
        }
        
        /* TaskController Prototype
        ------------------------------------------*/
        TaskController.prototype.init = function () {
            var self = this;
            
            // setup task event listeners
            this.applyHandlers();
            
            // severity styling handling
            if (config.gui.severityStyles) {
                setTimeout(function () {
                    self.setAllSeverityStyles();
                }, 100);
                bh.application.on("change", function () {
                    setTimeout(self.setAllSeverityStyles, 100);
                });
            }
        };
        
        // get task data by local id
        TaskController.prototype.findModelByLocalId = function (id) {
            var tasks = this.baseApi.tasks(),
                len = tasks.length,
                i = 0;
            
            // loop through and check the local_task_id attribute
            for (i; i < len; i += 1) {
                if (tasks[i].attributes.local_task_id === id) {
                    return tasks[i];
                }
            }
        };
        
        // get task data by global id
        TaskController.prototype.findModelByGlobalId = function (id) {
            var tasks = this.baseApi.tasks(),
                len = tasks.length,
                i = 0;
            
            // loop through and check the global id
            for (i; i < len; i += 1) {
                if (tasks[i].id === id) {
                    return tasks[i];
                }
            }
        };
        
        // gets the browser info from a task
        TaskController.prototype.getBrowserInfo = function (task, key) {
            // catch invalid task types
            if (!util.isObject(task) && !util.isNumber(task)) {
                util.log("error", "Unable to get task from parameter of type " +
                        typeof task);
            }
            
            // passed an id
            if (util.isNumber(task)) {
                // passed a global id
                if (task > 1000000) {
                    task = this.findModelByGlobalId(task);
                } else {
                    // passed a local id
                    task = this.findModelByLocalId(task);
                }
            }
            
            return task.attributes.browser_info[key] ||
                task.attributes.browser_info;
        };
        
        // gets the user meta data from a task
        TaskController.prototype.getMeta = function (task) {
            // passed an id
            if (util.isNumber(task)) {
                // passed a global id
                if (task > 1000000) {
                    task = this.findModelByGlobalId(task);
                } else {
                    // passed a local id
                    task = this.findModelByLocalId(task);
                }
            }
            
            return task.attributes.data.userMetaData;
        };
        
        // gets an array of tasks with specified meta data
        TaskController.prototype.findAllWithMeta = function (attr, value) {
            return this.match(function (task) {
                var meta = task.getData().userMetaData || {};
                
                // capture tasks without meta
                if (!util.isDefined(meta[attr])) {
                    return false;
                }
                
                return (
                    meta[attr] === value ||
                    util.contains(meta[attr], value)
                ) ? true : false;
            });
        };
        
        // gets an array of tasks with specified attribute
        TaskController.prototype.findAllWithAttribute = function (attr, value) {
            return this.match(function (task) {
                var attrs = task.attributes;
                
                return (
                    attrs[attr] === value ||
                    util.contains(attrs[attr], value)
                ) ? true : false;
            });
        };
        
        // gets an array of tasks with specified browser data
        TaskController.prototype.findAllWithClientData = function (attr, value) {
            return this.match(function (task) {
                var data = task.getBrowserData() || {};
                
                // capture tasks without client data
                if (!util.isDefined(data[attr])) {
                    return false;
                }
                
                return (
                    data[attr] === value ||
                    util.contains(data[attr], value)
                ) ? true : false;
            });
        };
        
        // retrieves tasks that have a certain tag
        TaskController.prototype.findAllWithTag = function (tag) {
            return this.match(function (task) {
                var tags = task.attributes.tag_names;
                return (util.contains(tags, tag)) ? true : false;
            });
        };
        
        TaskController.prototype.match = function (matched) {
            var tasks = this.api.models,
                len = tasks.length,
                results = [],
                i = 0,
                task;
            
            // check meta of tasks
            for (i; i < len; i += 1) {
                task = tasks[i];
                if (matched(task)) {
                    results.push(task);
                }
            }
            
            return results;
        };
        
        // apply event handlers
        TaskController.prototype.applyHandlers = function () {
            // event logger
            var
                self = this,
                bh = this.baseApi,
                
                // event logging
                eventLog = function (task, type, msg) {
                    // pull attributes
                    var user = task.attributes.requester_name,
                        id = task.attributes.local_task_id,
                        
                        // status
                        prevStatusId = task._previousAttributes.status_id,
                        statusId = task.attributes.status_id,
                        prevStatus = bh.getStatusFromId(prevStatusId),
                        status = bh.getStatusFromId(statusId),
                        
                        // severity
                        severityId = task.attributes.priority_id,
                        severity = bh.getPriorityFromId(severityId),
                        
                        message;

                    // format message with values
                    message = msg.replace("${user}", user);
                    message = message.replace("${id}", id);
                    message = message.replace("${prevStatus}", prevStatus);
                    message = message.replace("${status}", status);
                    message = message.replace("${severity}", severity);
                    
                    util.log(
                        "context:bugherd",
                        type,
                        task,
                        message
                    );

                    // set the recent task
                    cache.RECENT_TASK = task;
                };
            
            // task creation
            this.on("add", function (event) {
                eventLog(
                    event,
                    "okay",
                    "Task '#${id}' created by '${user}'"
                );
                
                self.setAllSeverityStyles();
            });
            
            // task deletion
            this.on("remove", function (event) {
                eventLog(
                    event,
                    "warn",
                    "Task '#${id}' was deleted"
                );
                
                // if task is expanded
                if (status.interactor.taskDetailsExpanded) {
                    // task is deleted task
                    if (parseInt(interactor.activeTask, 10) === event.attributes.local_task_id) {
                        interactor.closeTask();
                    }
                }
                
                self.setAllSeverityStyles();
            });
            
            // on task refresh
            this.on("refresh", function (event) {
                eventLog(
                    event,
                    "info",
                    "Task '#${id}' refreshed"
                );
                
                self.setAllSeverityStyles();
            });
            
            // task status updates
            this.on("change:status_id", function (event) {
                eventLog(
                    event,
                    "info",
                    "Task '#${id}' moved from " +
                        "'${prevStatus}' to '${status}'"
                );
                
                self.setAllSeverityStyles();
            });
            
            // task severity updates
            this.on("change:priority_id", function (event) {
                eventLog(
                    event,
                    "info",
                    "Task '#${id}' set to '${severity}'"
                );
                
                self.setAllSeverityStyles();
            });
        };
        
        // apply a handler to a bugherd task event
        TaskController.prototype.on = function (event, handler) {
            this.api.on(event, handler);
        };
        
        // apply a tasks severity style to its body
        TaskController.prototype.rSetSeverityStyle = function (task) {
            var severity;
            
            // create or retrieve a new Node instance for task
            task = new Node(document.querySelector("#task_" + task));
            severity = task.find(".task-severity");
            
            if (severity.length) {
                severity = severity[0]
                    .element
                    .className
                    .replace("task-severity", "")
                    .replace(/\s/g, "");

                task.addClass(severity);
            }
        };
        
        // apply severity styles to all tasks
        TaskController.prototype.rSetAllSeverityStyles = function () {
            var tasks = document.querySelectorAll(".task"),
                len = tasks.length,
                i = 0,
                id;
            
            for (i; i < len; i += 1) {
                id = tasks[i].id.replace("task_", "");
                
                if (id) {
                    this.setSeverityStyle(id);
                }
            }
        };
        
        /* BugHerd Prototype
        ------------------------------------------*/
        // init the bugherd api wrapper
        BugHerd.prototype.init = function () {
            this.tasks.init();
            this.applyContext();
            this.applyHandlers();
        };
        
        // apply handlers/listeners
        BugHerd.prototype.applyHandlers = function () {};
        
        // apply bugherd api logging context
        BugHerd.prototype.applyContext = function () {
            util.log(
                "context:bugherd",
                "buffer",
                "log-buffer: BUGHERD-API"
            );
        };
        
        // apply a handler to bugherd taskCollection event
        BugHerd.prototype.on = function (event, handler) {
            bh.application.on(event, handler);
        };
        
        // trigger a bugherd application event
        BugHerd.prototype.trigger = function (event) {
            bh.application.trigger(event);
        };
        
        // returns status name from id
        BugHerd.prototype.getStatusFromId = function (id) {
            var status,
                map = {
                    "null": "feedback",
                    "0": "backlog",
                    "1": "todo",
                    "2": "doing",
                    // obviously 3 was set free
                    "4": "done",
                    "5": "archive"
                };
            
            return map[id];
        };
        
        // returns priority/severity name from id
        BugHerd.prototype.getPriorityFromId = function (id) {
            var priority,
                map = {
                    "0": "not set",
                    "1": "critical",
                    "2": "important",
                    "3": "normal",
                    "4": "minor"
                };
            
            return map[id];
        };
        
        // returns all tasks for the current project
        BugHerd.prototype.getTasks = function () {
            return bh.application.tasksCollection.models;
        };
        
        return BugHerd;
    }
);