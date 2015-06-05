/*
*   @type javascript
*   @name task-filter.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    [
        'main/components/util',
        'main/components/repository',
        'main/components/configurator',
        'main/ui/node',
        'main/ui/view',
        'main/ui/field',
        'main/ui/modal'
    ],
    function (
        util,
        Repository,
        Configurator,
        Node,
        View,
        Field,
        Modal
    ) {
        'use strict';
            
        var config = new Configurator(),
            repo = new Repository(),
            bugherd = repo.get("bugherd"),
            interactor = repo.get("interactor"),
            view;
        
        // page one
        function one(args) {
            var node = new Node("div", "kbs-view"), gui = args[0], modal = args[1],
                filterData, filters = config.get("interactor/filters"),
                reset, apply, show, hide, tags, next;
            
            // modal title
            node.title = "Task Filters";
            
            // display method title
            node.addChild(new Field(
                "Display Method",
                "title"
            ));
            
            // show results
            show = node.addChild(new Field(
                "Show:",
                "checkbox",
                function (value) {
                    // set display method for the filter
                    filters.displayMethod = "show";
                    
                    // uncheck hide
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
                    // set display method for the filter
                    filters.displayMethod = "hide";
                    
                    // uncheck show
                    show.find(".kbs-input-field")[0]
                        .element.checked = false;
                },
                (filters.displayMethod === "hide") ? true : false
            ));
            
            // data title
            node.addChild(new Field(
                "Data Filters",
                "title"
            ));
            
            // tag filter
            tags = node.addChild(new Field(
                "Tags:",
                "text",
                function (value) {
                    var i = 0,
                        len;
                    
                    // get values
                    value = value.split(",");
                    len = value.length;
                    
                    // trim whitespace
                    for (i; i < len; i += 1) {
                        value[i] = value[i].trim();
                    }
                    
                    // concat filters
                    filters.tags = value;
                },
                filters.tags
            ));
            
            // apply filters with above options
            apply = node.createChild("span", "kbs-confirm")
                .text("apply")
                .on("click", function () {
                    // run tag filter
                    interactor[filters.displayMethod + "TasksWithTag"](filters.tags);
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
                    var sortLink = new Node(".sortLink");
                    config.set("interactor/filters", {});
                    modal.reload();
                    sortLink.element.click();
                    bugherd.tasks.setAllSeverityStyles();
                });
            
            next = node.createChild("span", "kbs-page-next")
                .text("next")
                .on("click", function () {
                    modal.reload(2);
                });
            
            return node;
        }
        
        // page two
        function two(args) {
            var node = new Node("div", "kbs-view"), gui = args[0], modal = args[1],
                filterData, filters = config.get("interactor/filters"),
                reset, apply, prev;
            
            // modal title
            node.title = "Task Filters";
            
            // apply filters with above options
            apply = node.createChild("span", "kbs-confirm")
                .text("apply")
                .on("click", function () {
                    // run tag filter
                    interactor[filters.displayMethod + "TasksWithTag"](filters.tags);
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
                    var sortLink = new Node(".sortLink");
                    config.set("interactor/filters", {});
                    modal.reload();
                    sortLink.element.click();
                    bugherd.tasks.setAllSeverityStyles();
                });
            
            prev = node.createChild("span", "kbs-page-prev")
                .text("prev")
                .on("click", function () {
                    modal.reload(1);
                });
            
            return node;
        }
            
        // create a new view
        view = new View([one, two]);

        return view;
    }
);