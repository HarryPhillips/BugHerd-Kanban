/*
*   @type javascript
*   @name task-search.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    [
        'main/components/util',
        'main/ui/node',
        'main/ui/view'
    ],
    function (util, Node, View) {
        'use strict';

        // create a new view
        var view = new View(function (args) {
            var node = new Node("div", "kbs-view"),
                gui = args[0],
                modal = args[1],
                input,
                go;
            
            // modal text
            node.title = "Search for a task";
            node.text("Enter a task id to search for:");
            
            // components
            input = node.createChild("input", "kbs-input-field")
                .attr("type", "number");
            
            go = node.createChild("div", "kbs-continue")
                .text("Go")
                .on("click", function () {
                    modal.trigger("proceed", input.text());
                });
            
            return node;
        });

        return view;
    }
);