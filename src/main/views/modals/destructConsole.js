/*
*   @type javascript
*   @name prompt.js
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
        var view = new View(function (modal) {
            var node = new Node("div", "kbs-view");
            
            // modal text
            node.title = "Destruct GUI Console";
            
            // message
            node
                .createChild("p")
                .text("Confirm destruction of GUI console?");
            
            // confirm
            node
                .createChild("span", "kbs-confirm")
                .text("confirm")
                .on("click", function () {
                    modal.onConfirm();
                });
            
            // cancel
            node
                .createChild("span", "kbs-cancel")
                .text("cancel")
                .on("click", function () {
                    modal.onCancel();
                });
            
            return node;
        });

        return view;
    }
);