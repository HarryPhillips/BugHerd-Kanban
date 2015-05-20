/*
*   @type javascript
*   @name userConfig.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    [
        'main/components/util',
        'main/components/node',
        'main/components/view',
        'main/components/field',
        'main/components/configurator',
        'main/ui/modal'
    ],
    function (
        util,
        Node,
        View,
        Field,
        Configurator,
        Modal
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
                
                // wallpaper
                node.addChild(new Field(
                    "Wallpaper:",
                    "text",
                    function (url) {
                        // set wallpaper config
                        config.set("gui/wallpaper", url);
                        
                        // load the new wallpaper
                        gui.loadWallpaper(url);
                    },
                    config.get("gui/wallpaper")
                ));
                
                // enable/disable parallax
                if (config.get("gui/wallpaper")) {
                    // shown only if a wallpaper is present
                    node.addChild(new Field(
                        "Enable Parallax:",
                        "checkbox",
                        function (value) {
                            config.set("gui/parallax/enabled", value);
                            util.refresh(200);
                        },
                        config.get("gui/parallax/enabled")
                    ));
                    
                    if (config.get("gui/parallax/enabled")) {
                        node.addChild(new Field(
                            "Parallax Factor:",
                            "number",
                            function (value) {
                                config.set("gui/parallax/factor", value);
                            }
                        ));
                    }
                }
                
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
                    "Enable Logs:",
                    "checkbox",
                    function (value) {
                        // enable/disable logging
                        config.set("logs/enabled", value);
                        util.refresh(200);
                    },
                    config.get("logs/enabled")
                ));
                
                // console object logs to buffer
                node.addChild(new Field(
                    "Log Objects to Buffer:",
                    "checkbox",
                    function (value) {
                        config.set("logs/obj2buffer", value);
                    },
                    config.get("logs/obj2buffer")
                ));
                
                // reset config button
                node.createChild("span", "kbs-confirm")
                    .text("Reset Settings")
                    .on("click", function () {
                        config.reset();
                    });
                
                // show data button
                node.createChild("span", "kbs-confirm")
                    .text("Show Data")
                    .on("click", function () {
                        // log and show user data
                        var modal = new Modal("userData");
                    });

                return node;
            });

        return view;
    }
);