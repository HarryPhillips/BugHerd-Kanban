/*
*   @type javascript
*   @name input.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    [
        'main/components/util',
        'main/components/node',
        'main/components/view'
    ],
    function (util, Node, View) {
        'use strict';

        // create a new view
        var view = new View(function (modal) {
            var node = new Node("div", "kbs-view"),
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
                    modal.onProceed(input.text());
                });
            
            return node;
        });

        return view;
    }
);