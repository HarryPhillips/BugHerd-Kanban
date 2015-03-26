/*
*   @type javascript
*   @name node.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    ['config'],
    function () {
        'use strict';
        
        // node constructor
        function Node(type, classes, id) {
            this.element = document.createElement(type);
            this.element.className = classes || "";
            this.element.id = id || "";
        }

        // add a child to node
        Node.prototype.addChild = function (node) {
            // add child to node
            this.element.appendChild(node);
        };

        // create and add child to node
        Node.prototype.createChild = function (type, classes, id) {
            var node = new Node(type, classes, id);
            this.addChild(node.element);
            return node;
        };
        
        return Node;
    }
);