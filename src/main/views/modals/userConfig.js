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
        'main/components/field',
        'main/components/configurator'
    ],
    function (
        util,
        Node,
        View,
        Field,
        Configurator
    ) {
        'use strict';
        
        var
            // configurator instance    
            config = new Configurator(),
        
            // create a new view
            view = new View(function (args) {
                var node = new Node("div", "kbs-view"),
                    gui = args[0],
                    modal = args[1];

                // modal text
                node.title = "Kanban Settings";

                // theme
                node.addChild(new Field(
                    "Theme:",
                    "text",
                    function (value) {
                        // set theme config
                        config.set("theme", value);
                        
                        // set new theme to gui
                        gui.loadTheme(value);
                    },
                    config.get("theme")
                ));
                
                // console state
                node.addChild(new Field(
                    "Console State on Load:",
                    "text",
                    function (value) {
                        // make sure is a valid state class
                        if (value.indexOf("kbs-") === -1) {
                            value = "kbs-" + value;
                        }
                        
                        // set console state
                        config.set("gui/console/state", value);
                    },
                    config.get("gui/console/state")
                ));
                
                // console logs
                node.addChild(new Field(
                    "Enable Logs",
                    "checkbox",
                    function (value) {
                        // enable/disable logging
                        alert(value);
                        config.set("logs/enabled", value);
                    }
                ));
                
                // reset config button
                node.createChild("span", "kbs-confirm")
                    .text("Reset Settings")
                    .on("click", function () {
                        config.reset();
                    });

                return node;
            });

        return view;
    }
);