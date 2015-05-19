/*
*   @type javascript
*   @name bugherd.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    [
        'config',
        'main/components/util',
        'main/components/cache'
    ],
    function (config, util, cache) {
        'use strict';
        
        var bh = window.bugherd;
        
        // bugherd api wrapper
        function BugHerd() {
            this.api = bh;
        }
        
        // init the bugherd api wrapper
        BugHerd.prototype.init = function () {
            this.applyContext();
            this.applyHandlers();
        };
        
        // apply handlers/listeners
        BugHerd.prototype.applyHandlers = function () {
            var self = this;
            
            // on task creation
            bh.application.tasksCollection.on(
                "add",
                function (task) {
                    var user = task.attributes.requester_name,
                        id = task.attributes.local_task_id;
                    
                    util.log(
                        "context:bugherd",
                        "okay",
                        task,
                        "Task '#" +
                            id + "' created by '" +
                            user + "'"
                    );
                    
                    cache.working_task = task;
                }
            );
            
            // on task deletion
            bh.application.tasksCollection.on(
                "remove",
                function (task) {
                    var id = task.attributes.local_task_id;
                    
                    util.log(
                        "context:bugherd",
                        "warn",
                        task,
                        "Task '#" +
                            id + "' was deleted"
                    );
                    
                    cache.working_task = task;
                }
            );
            
            // on task change
            bh.application.tasksCollection.on(
                "change:status_id",
                function (task) {
                    var user = task.attributes.requester_name,
                        id = task.attributes.local_task_id,
                        prevStatus = self.getStatusFromId(task._previousAttributes.status_id),
                        status = self.getStatusFromId(task.attributes.status_id);
                    
                    util.log(
                        "context:bugherd",
                        "okay",
                        task,
                        "Task '#" +
                            id + "' status changed by '" +
                            user + "'" +
                            " from '" + prevStatus + "'" +
                            " to '" +
                            status + "'"
                    );
                    
                    cache.working_task = task;
                }
            );
        };
        
        // apply bugherd api logging context
        BugHerd.prototype.applyContext = function () {
            util.log(
                "context:bugherd",
                "info",
                "BugHerd API log output..."
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
                    //"3": "doing",
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