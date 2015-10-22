/*
*   @type javascript
*   @name task-search.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    [
        'main/components/util',
        'main/ui/node',
        'main/ui/modal',
        'main/ui/view',
        'main/ui/field',
        'main/components/repository'
    ],
    function (util, Node, Modal, View, Field, Repository) {
        'use strict';

        // set the repo
        var repo = new Repository(),

        // create a new view
        view = new View(function (args) {
            var node = new Node("div", "kbs-view"),
                interactor = repo.get("interactor"),
                gui = args[0],
                modal = args[1],
                input,
                go,

                // error function
                error = function (id) {
                    node.find(".error")[0].show();
                },

                // inspection function
                inspect = function (id) {
                    var model = interactor.findModel(id);

                    // if no model was found for task, show error
                    if (!model) {
                        return error(id);
                    }

                    var result = null,
                        attrs = model.attributes,
                        createTimestamp = new Date(attrs.created_at),
                        updateTimestamp = new Date(attrs.updated_at);

                    // set new styles for inspection
                    modal.node.css("height", "500px");
                    modal.node.css("margin-top", "-250px");
                    modal.node.find(".kbs-modal-content")[0].css("text-align", "left");

                    // clear the view
                    node.clear();

                    // set new modal title
                    modal.setTitle("Inspecting task #" + id);

                    // show creation and last updated date
                    node.addChild(new Field(
                        "Created at:",
                        "static",
                        util.fdate(createTimestamp) + " " + util.ftime(createTimestamp, false) + " GMT"
                    ));

                    node.addChild(new Field(
                        "Last update at:",
                        "static",
                        util.fdate(updateTimestamp) + " " + util.ftime(updateTimestamp, false) + " GMT"
                    ));

                    // show raw data
                    node.createChild("div")
                        .css("margin-top", "30px")
                        .text("Raw Model:");
                    node.createChild("pre")
                        .text(JSON.stringify(model, null, 4));
                };

            // when modal closes, destroy
            modal.on("close", function () {
                modal.destroy();
            });

            // modal title
            node.title = "Which task do you want to inspect?";

            // error label
            node.createChild("div", "error")
                .hide()
                .text("No task found! Try again");

            // search label
            node.createChild("div", "search")
                .text("Enter the task id:");

            node.createChild("br");

            // components
            input = node.createChild("input", "kbs-input-field")
                .attr("type", "number");

            // commit inspection
            go = node.createChild("div", "kbs-continue")
                .text("Inspect")
                .on("click", function () {
                    inspect(input.text());
                });

            return node;
        });

        return view;
    }
);
