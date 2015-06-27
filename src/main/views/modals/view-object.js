/*
*   @type javascript
*   @name view-object.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    [
        'main/components/util',
        'main/ui/node',
        'main/ui/view',
        'main/ui/field',
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
                    params = args[2],
                    dataNode;

                // modal title
                node.title = "Object Inspector";

                // modal message
                node.createChild("span", "kbs-message")
                    .text(params.message);

                // function to get object?
                if (util.isFunction(params.object)) {
                    params.object = params.object();
                }

                // formatted object
                dataNode = node.createChild("pre");

                // reload data on open
                modal.on("open", function () {
                    dataNode.addChild(
                        document.createTextNode(
                            JSON.stringify(params.object, null, 4)
                        )
                    );
                });

                // destroy the modal when it's closed
                modal.on("close", modal.destroy);

                util.log("context:gui", "debug", params.object, "Viewing object:");

                return node;
            });

        return view;
    }
);
