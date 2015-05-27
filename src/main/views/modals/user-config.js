/*
*   @type javascript
*   @name user-config.js
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
                    modal = args[1],
                    defFilter;

                // modal text
                node.title = "Kanban Settings";

                // open tasks on click setting
                node.addChild(new Field(
                    "Open Task on Click:",
                    "checkbox",
                    function (value) {
                        config.set("interactor/expandOnclick", value);
                    },
                    config.get("interactor/expandOnclick")
                ));
                
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
                        config.set("gui/wallpaper", url, true);
                        
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
                            },
                            config.get("gui/parallax/factor")
                        ));
                    }
                }
                
                // console state
                node.addChild(new Field(
                    "Menu State on Load:",
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
                
                // console log filter
                if (config.get("logs/enabled")) {
                    // console log filter
                    defFilter = config.get("logs/filter");
                    
                    // filter is array
                    if (util.isArray(defFilter)) {
                        defFilter = defFilter.join(", ");
                    }

                    // no filter
                    if (!defFilter) {
                        defFilter = "";
                    }
                    
                    node.addChild(new Field(
                        "Log Filter:",
                        "text",
                        function (value) {
                            var i = 0,
                                len;
                            
                            // get array of filter values
                            value = value.replace(/\s/g, "");
                            value = value.split(",");
                            len = value.length;
                            
                            // set filter
                            config.set("logs/filter", value);
                        },
                        defFilter
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
                }
                
                // app tests
                node.addChild(new Field(
                    "Tests:",
                    "checkbox",
                    function (value) {
                        config.set("test");
                        util.refresh(200);
                    },
                    config.get("test")
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
                        // show user data
                        var modal = new Modal("user-data");
                    });

                return node;
            });

        return view;
    }
);