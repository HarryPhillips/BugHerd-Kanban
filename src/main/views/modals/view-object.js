/*
*   @type javascript
*   @name view-object.js
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
                dataNode.text(util.serialise(params.object));
                
                // reload data on open
                modal.on("open", function () {
                    dataNode.text(util.serialise(params.object), true);
                });
                
                // destroy the modal when it's closed
                modal.on("close", modal.destroy);
                
                return node;
            });

        return view;
    }
);