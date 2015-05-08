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
        'main/components/view',
        'main/components/configurator'
    ],
    function (util, Node, View, Configurator) {
        'use strict';
        
        var
            // configurator instance    
            config = new Configurator(),
        
            // create a new view
            view = new View(function (args) {
                var node = new Node("div", "kbs-view"),
                    gui = args[0],
                    modal = args[1];

                // field class
                function Field(text, type, handler) {
                    var field = new Node("div", "kbs-field"),
                        label,
                        input,
                        submit;

                    // label
                    label = field.createChild("span", "kbs-label")
                        .text(text);

                    // input
                    input = field.createChild("input", "kbs-input-field")
                        .attr("type", type);

                    // submit
                    submit = field.createChild("span", "kbs-confirm")
                        .text("set")
                        .on("click", function () {
                            handler(input.text());
                        });

                    return field;
                }

                // modal text
                node.title = "Kanban Settings";

                // theme config
                node.addChild(new Field(
                    "Theme:",
                    "text",
                    function (value) {
                        // set theme config
                        config.set("theme", value);
                        
                        // set new theme to gui
                        gui.loadTheme(value);
                    }
                ));

                return node;
            });

        return view;
    }
);