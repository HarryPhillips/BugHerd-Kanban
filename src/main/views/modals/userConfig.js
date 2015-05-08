/*
*   @type javascript
*   @name settings.js
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
            var node = new Node("div", "kbs-view");
            
            // modal text
            node.title = "Kanban Settings";
            node.text("Kanban user configuration");
            
            return node;
        });

        return view;
    }
);