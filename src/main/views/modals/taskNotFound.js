/*
*   @type javascript
*   @name taskNotFound.js
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
        var view = new View(function (args) {
            var node = new Node("div", "kbs-view"),
                gui = args[0],
                modal = args[1],
                id = modal.params.id || "null";
            
            // modal text
            node.title = "Task Not Found";
            
            // message
            node
                .createChild("p")
                .text("Couldn't find task #" + id + "!");
            
            // confirm
            node
                .createChild("span", "kbs-confirm")
                .text("search again")
                .on("click", function () {
                    modal.trigger("confirm");
                });
            
            // cancel
            node
                .createChild("span", "kbs-cancel")
                .text("close")
                .on("click", function () {
                    modal.trigger("cancel");
                });
            
            return node;
        });

        return view;
    }
);