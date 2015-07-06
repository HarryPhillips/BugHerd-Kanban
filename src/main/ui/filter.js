/*
*   @type javascript
*   @name filters.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    ["main/components/repository"],
    function (Repository) {
        "use strict";

        var repo = new Repository(),
            interactor = repo.get("interactor"),
            bugherd = repo.get("bugherd");
        
        // filters class
        function Filter() {
            this.action = null;
            
            // tag filter
            this.tags = [];
            
            // client/browser data filter
            this.client = {
                key: null,
                value: null
            };
            
            // metadata filter
            this.meta = {
                key: null,
                value: null
            };
        }

        // apply filters using passed filter data
        Filter.prototype.apply = function (data) {
            var action = this.action,
                clientKey = this.client.key,
                clientVal = this.client.value,
                metaKey = this.meta.key,
                metaVal = this.meta.value;
            
            // tag filtering
            if (this.tags) {
                this.filterTag(
                    action,
                    this.tags
                );
            }
            
            // client filtering
            if (this.client.key && this.client.value) {
                if (clientKey.indexOf("[attr]") === 0) {
                    
                }
                
                this.filterClient(
                    action,
                    this.client.key,
                    this.client.value
                );
            }
            
            // meta filtering
            if (this.meta.key && this.meta.value) {
                this.filterMeta(
                    action,
                    this.meta.key,
                    this.meta.value
                );
            }
        };
        
        // return list of tasks which match filter
        Filter.prototype.match = function () {
            
        };
        
        // tag filters
        Filter.prototype.filterTag = function (tags) {};
        
        // attribute filters
        Filter.prototype.filterAttribute = function (name) {};

        // client/browser data filters
        Filter.prototype.filterClient = function (attr) {
            
        };
        
        // metadata filters
        Filter.prototype.filterMeta = function (attr) {
            
        };
        
        // reset all filters
        Filter.prototype.reset = function () {
            var tasks = bugherd.getTasks(),
                element;
            
            tasks.forEach(function (item, index) {
                element = document.getElementById("task_" + tasks[index].id);
                
                if (element) {
                    element.style.display = "block";
                }
            });
        };
        
        // hides all tasks
        Filter.prototype.hideAll = function () {
            var tasks = bugherd.getTasks(),
                element;
            
            tasks.forEach(function (item, index) {
                element = document.getElementById("task_" + tasks[index].id);
                
                if (element) {
                    element.style.display = "none";
                }
            });
        };
        
        // show all tasks
        Filter.prototype.showAll = function () {
            
        };
        
        return Filter;
    }
);