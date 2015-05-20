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
        'main/components/status'
    ],
    function (config, util, cache, status) {
        'use strict';
        
        // bugherd's global api
        var bh = window.bugherd,
            interactor,
            gui;
        
        /* Class Definitions
        ------------------------------------------*/
        // task api controller
        function TaskController(base) {
            this.api = bh.application.tasksCollection;
            this.baseApi = base;
        }
        
        // bugherd api wrapper
        function BugHerd(interInstance, guiInstance) {
            // set instances
            interactor = interInstance;
            gui = guiInstance;
            
            this.api = bh;
            this.tasks = new TaskController(this);
        }
        
        /* TaskController Prototype
        ------------------------------------------*/
        TaskController.prototype.init = function () {
            // setup task event listeners
            this.applyHandlers();
        };
        
        TaskController.prototype.applyHandlers = function () {
            // event logger
            var
                bh = this.baseApi,
                
                // event logging
                eventLog = function (task, msgType, msg) {
                    // pull attributes
                    var user = task.attributes.requester_name,
                        id = task.attributes.local_task_id,
                        prevStatus = bh.getStatusFromId(task._previousAttributes.status_id),
                        status = bh.getStatusFromId(task.attributes.status_id),
                        message;

                    // format message with values
                    message = msg.replace("${user}", user);
                    message = message.replace("${id}", id);
                    message = message.replace("${prevStatus}", prevStatus);
                    message = message.replace("${status}", status);
                    
                    util.log(
                        "context:bugherd",
                        msgType,
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
            });
            
            // task status updates
            this.on("change:status_id", function (event) {
                eventLog(
                    event,
                    "log",
                    "Task '#${id}' moved from " +
                        "'${prevStatus}' to '${status}'"
                );
            });
        };
        
        // apply a handler to a bugherd task event
        TaskController.prototype.on = function (event, handler) {
            this.api.on(event, handler);
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
        
        // returns all tasks for the current project
        BugHerd.prototype.tasks = function () {
            return bh.application.tasksCollection.models;
        };
        
        return BugHerd;
    }
);