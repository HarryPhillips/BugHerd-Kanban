/*
*   @type javascript
*   @name viewScreenshot.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    [
        'main/components/util',
        'main/components/node',
        'main/components/view'
    ],
    function (util, Node, View) {
        'use strict';

        // create a new view
        var view = new View(function (args) {
            var node = new Node("div", "kbs-view"),
                gui = args[0],
                modal = args[1],
                params = args[2],
                wrap,
                img;
            
            // modal title
            node.title = "Screenshot for task #" + params.id;
            
            // screenshot wrapper
            wrap = node.createChild("div", "kbs-screenshot-wrap");
            
            // screenshot
            img = wrap.createChild("img", "kbs-screenshot")
                .attr("src", params.url)
                .css("width", "auto")
                .css("height", "auto");
            
            // destroy the modal when it is closed
            modal.on("close", modal.destroy);
            
            return node;
        });

        return view;
    }
);