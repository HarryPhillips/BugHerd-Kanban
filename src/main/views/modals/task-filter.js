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
            filters = {
                displayMethod: "show",
                clientdata: {},
                metadata: {}
            },
            view;
        
        // page one
        function one(args) {
            var node = new Node("div", "kbs-view"), gui = args[0], modal = args[1],
                filterData,
                reset, apply, show, hide, list,
                tags,
                clientkey, clientvalue,
                metakey, metavalue,
                submit;
            
            // filter application
            function applyFilter() {
                if (filters.displayMethod === "show") {
                    // hide all tags before application
                    interactor.hideAllTasks();
                }
                
                // run tag filter
                if (filters.tags) {
                    interactor.onTasksWithTag(
                        filters.displayMethod,
                        filters.tags
                    );
                }

                // run browser filter
                if (filters.clientdata.key && filters.clientdata.value) {
                    interactor.onTasksWithClientData(
                        filters.displayMethod,
                        filters.clientdata.key,
                        filters.clientdata.value
                    );
                }

                // run meta filter
                if (filters.metadata.key && filters.metadata.value) {
                    interactor.onTasksWithMetaData(
                        filters.displayMethod,
                        filters.metadata.key,
                        filters.metadata.value
                    );
                }
            }
            
            // uncheck methods
            function uncheckMethods(exclusion) {
                var methods = [hide, show, list],
                    i = 0,
                    len = methods.length;
                
                for (i; i < len; i += 1) {
                    if (methods[i] !== exclusion) {
                        methods[i].find(".kbs-input-field")[0]
                            .element.checked = false;
                    }
                }
            }
            
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
                    uncheckMethods(show);
                },
                (filters.displayMethod === "show") ? true : false
            ));
            
            // default to show displayMethod
            show.find(".kbs-input-field")[0]
                .element.checked = true;

            // hide results
            hide = node.addChild(new Field(
                "Hide:",
                "checkbox",
                function (value) {
                    // set display method for the filter
                    filters.displayMethod = "hide";
                    uncheckMethods(hide);
                },
                (filters.displayMethod === "hide") ? true : false
            ));
            
            // list results
            list = node.addChild(new Field(
                "List:",
                "checkbox",
                function (value) {
                    // set display method for the filter
                    filters.displayMethod = "list";
                    uncheckMethods(list);
                }
            ));
            
            // tag title
            node.addChild(new Field(
                "Filter By Tag",
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
            
            // client data title
            node.addChild(new Field(
                "Filter By Client Data",
                "title"
            ));
            
            // client data key filter
            clientkey = node.addChild(new Field(
                "Client Data:",
                "select",
                function (value) {
                    filters.clientdata.key = value;
                },
                [
                    {text: "OS", value: "os"},
                    {text: "Browser", value: "browser"},
                    {text: "Window Size", value: "window_size"},
                    {text: "Resolution", value: "resolution"}
                ]
            ));
            
            // client data value filter
            clientvalue = node.addChild(new Field(
                "Contains:",
                "text",
                function (value) {
                    filters.clientdata.value = value;
                }
            ));
            
            // meta data title
            node.addChild(new Field(
                "Filter By Meta Data",
                "title"
            ));
            
            // meta data key filter
            metakey = node.addChild(new Field(
                "Meta Data:",
                "select",
                function (value) {
                    filters.metadata.key = value;
                },
                [
                    {text: "Selection", value: "Selection"},
                    {text: "User", value: "User"},
                    {text: "Reference", value: "Reference"},
                    {text: "Version", value: "Version"},
                    {text: "Report Time", value: "Report Time"},
                    {text: "Render Time", value: "Render Time"},
                    {text: "Attach. Size", value: "Attach. Size"}
                ]
            ));
            
            // meta data value filter
            metavalue = node.addChild(new Field(
                "Contains:",
                "text",
                function (value) {
                    filters.metadata.value = value;
                }
            ));
            
            // modal submission wrapper
            submit = node.createChild("div", "kbs-submit-field");
            
            // apply filters with above options
            apply = submit.createChild("span", "kbs-confirm")
                .text("apply")
                .on("click", applyFilter);
            
            // show filters
            filterData = submit.createChild("span", "kbs-confirm")
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
            reset = submit.createChild("span", "kbs-confirm")
                .text("reset")
                .on("click", function () {
                    var sortLink = new Node(".sortLink");
                
                    // reset filters
                    filters = {
                        displayMethod: "show",
                        clientdata: {},
                        metadata: {}
                    };
            
                    // default to show displayMethod
                    show.find(".kbs-input-field")[0]
                        .element.checked = true;
                
                    // reload modal
                    modal.reload();
                
                    // reset displayed tasks and reset styles
                    sortLink.element.click();
                    interactor.showAllTasks();
                    bugherd.tasks.setAllSeverityStyles();
                });
            
            return node;
        }
            
        // create a new view
        view = new View(one);

        return view;
    }
);