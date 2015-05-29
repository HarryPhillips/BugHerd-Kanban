/*
*   @type javascript
*   @name user-data.js
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
                    dataNode;

                // modal title
                node.title = "Raw User Config Data";
                
                // modal message
                node.createChild("span", "kbs-message")
                    .text("User configuration settings in JSON format:");
                
                // formatted cookie string
                dataNode = node.createChild("pre")
                    .text(config.getFormattedUserCookie());
                
                // reload data on open
                modal.on("open", function () {
                    dataNode.text(config.getFormattedUserCookie(), true);
                });
                
                return node;
            });

        return view;
    }
);