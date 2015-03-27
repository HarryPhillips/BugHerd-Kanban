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
            // set props
            this.type = type;
            this.classes = classes;
            this.selector = id;
            
            // create element
            this.element = document.createElement(type);
            this.element.className = classes || "";
            
            if (id) {
                this.element.id = id;
            }
        }

        // add a child to node
        Node.prototype.addChild = function (node) {
            // check if node is an instance of class Node
            if (node.constructor === Node || node instanceof Node) {
                this.element.appendChild(node.element);
                return;
            }
            
            // just a HTML node, append
            this.element.appendChild(node);
        };

        // create and add child to node
        Node.prototype.createChild = function (type, classes, id) {
            var node = new Node(type, classes, id);
            this.addChild(node.element);
            return node;
        };
        
        // delete node and it's children
        Node.prototype.destroy = function () {
            this.element.parentNode.removeChild(this.element);
        };
        
        // clone node instance and return
        Node.prototype.clone = function () {
            var clone = new Node(
                this.type,
                this.classes,
                this.selector
            );
            
            // nullify the new node element and clone this
            clone.element = null;
            clone.element = this.element.cloneNode();
            
            return clone;
        };
        
        return Node;
    }
);