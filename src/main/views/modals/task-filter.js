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
        'main/ui/node',
        'main/ui/view',
        'main/ui/field',
        'main/ui/modal'
    ],
    function (util, Configurator, Node, View, Field, Modal) {
        'use strict';

        var config = new Configurator(),
            filters = {
                displayMethod: "hide"
            },
            view;
        
        // create a new view
        view = new View(function (args) {
            var node = new Node("div", "kbs-view"),
                gui = args[0],
                modal = args[1],
                filterData,
                reset,
                apply,
                show,
                hide;
            
            // modal text
            node.title = "Task Filters";
            
            // show results
            show = node.addChild(new Field(
                "Show:",
                "checkbox",
                function (value) {
                    filters.displayMethod = "show";
                    
                    hide.find(".kbs-input-field")[0]
                        .element.checked = false;
                },
                (filters.displayMethod === "show") ? true : false
            ));

            // hide results
            hide = node.addChild(new Field(
                "Hide:",
                "checkbox",
                function (value) {
                    filters.displayMethod = "hide";
                    
                    show.find(".kbs-input-field")[0]
                        .element.checked = false;
                },
                (filters.displayMethod === "hide") ? true : false
            ));
            
            // apply filters with above options
            apply = node.createChild("span", "kbs-confirm")
                .text("apply")
                .on("click", function () {
            
                });
            
            // show filters
            filterData = node.createChild("span", "kbs-confirm")
                .text("show filter")
                .on("click", function () {
                    var modal = new Modal("view-object", {
                        viewParams: {
                            message: "Filter settings:",
                            object: filters
                        }
                    });
                });
            
            // reset filters
            reset = node.createChild("span", "kbs-confirm")
                .text("reset")
                .on("click", function () {
            
                });
            
            return node;
        });

        return view;
    }
);