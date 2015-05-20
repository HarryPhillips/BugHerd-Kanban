/*
*   @type javascript
*   @name userData.js
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

                // modal title
                node.title = "Raw User Config Data";
                
                // modal message
                node.createChild("span", "kbs-message")
                    .text("User configuration settings in JSON format:");
                
                // formatted cookie string
                node.createChild("pre")
                    .text(config.getFormattedUserCookie());
                
                return node;
            });

        return view;
    }
);