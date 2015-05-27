/*
*   @type javascript
*   @name task-filter.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    [
        'main/components/util',
        'main/components/configurator',
        'main/components/node',
        'main/components/view',
        'main/components/field'
    ],
    function (util, Configurator, Node, View, Field) {
        'use strict';

        var config = new Configurator(),
            view;
        
        // create a new view
        view = new View(function (args) {
            var node = new Node("div", "kbs-view"),
                gui = args[0],
                modal = args[1],
                filters = {},
                show,
                hide,
                apply;
            
            // modal text
            node.title = "Task Filters";
            
            // show results
            node.addChild(new Field(
                "Show:",
                "checkbox",
                function (value) {},
                filters.show
            ));

            // hide results
            node.addChild(new Field(
                "Hide:",
                "checkbox",
                function (value) {},
                filters.hide
            ));
            
            // apply filters with above options
            apply = node.createChild("span", "kbs-confirm")
                .text("apply")
                .on("click", function () {
            
                });
            
            // reset filters
            apply = node.createChild("span", "kbs-confirm")
                .text("reset")
                .on("click", function () {
            
                });
            
            return node;
        });

        return view;
    }
);