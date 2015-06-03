/*
*   @type javascript
*   @name node.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    ['config', 'main/components/util'],
    function (config, util) {
        'use strict';
        
        // instance monitoring
        var ALL_NODES = [];
        
        // node constructor
        function Node(type, classes, id) {
            // is a selector passed
            if (util.isString(type)) {
                if (type.charAt(0) === "#" || type.charAt(0) === ".") {
                    return new Node(document.querySelector(type), classes, id);
                }
            }
            
            // check if a node with this exact element
            // already exists - if it does, return it
            var len = ALL_NODES.length,
                assoc = this.findAssociatedNode(type),
                i = 0;
            
            
            // return associated Node instance if found
            if (assoc) {
                return assoc;
            }
            
            // update instance monitor
            ALL_NODES.push(this);
            
            // props
            this.children = [];
            this.textNodes = [];
            
            // check if passed an HTML node
            if (util.isDomElement(type)) {
                this.element = type;
            } else {
                // set props
                this.settings = {
                    type: type,
                    classes: classes,
                    id: id
                };

                // create element
                this.element = document.createElement(type);
                this.element.className = classes || "";

                if (id) {
                    this.element.id = id;
                }
            }
        }
        
        // show node
        Node.prototype.show = function () {
            this.element.style.display = "block";
            return this;
        };
        
        // hide node
        Node.prototype.hide = function () {
            this.element.style.display = "none";
            return this;
        };
        
        // toggle node
        Node.prototype.toggle = function () {
            var method = (this.element.style.display === "none") ? "block" : "none";
            this.element.style.display = method;
            return this;
        };
        
        // fade in node
        Node.prototype.fadeIn = function (args) {
            if (typeof window.jQuery === "undefined") {
                this.show();
                return this;
            }
            
            // jquery fade in
            window.jQuery(this.element).fadeIn(args);
            
            return this;
        };
        
        // fade out node
        Node.prototype.fadeOut = function (args) {
            if (typeof window.jQuery === "undefined") {
                this.hide();
                return this;
            }
            
            // jquery fade out
            window.jQuery(this.element).fadeOut(args);
            
            return this;
        };
        
        // return current element id
        Node.prototype.getId = function () {
            return this.element.id;
        };
        
        // return current element classes
        Node.prototype.getClasses = function () {
            return this.element.className;
        };
        
        // return if node has a class
        Node.prototype.hasClass = function (name) {
            var i, len,
                found = false;
            
            // is there an array of names to check?
            if (util.isArray(name)) {
                len = name.length;
                for (i = 0; i < len; i += 1) {
                    if (this.element.className.indexOf(name[i]) !== -1) {
                        found = true;
                    }
                }
            } else {
                if (this.element.className.indexOf(name) !== -1) {
                    found = true;
                }
            }
            
            return found;
        };
        
        // add class(es) to node
        Node.prototype.addClass = function (classes) {
            if (this.element.className.indexOf(classes) !== -1) {
                return;
            }
            
            if (this.element.className === "") {
                // no previous classes
                this.element.className = classes;
            } else {
                // add whitespace
                this.element.className += " " + classes;
            }
        };

        // remove class(es) from node
        Node.prototype.removeClass = function (classes) {
            // declarations
            var curr = this.element.className,
                newclass,
                i,
                remove = function (name) {
                    if (curr.indexOf(" " + name) !== -1) {
                        newclass = curr.replace(" " + name, "");
                    } else if (curr.indexOf(name + " ") !== -1) {
                        newclass = curr.replace(name + " ", "");
                    } else {
                        newclass = curr.replace(name, "");
                    }
                };
            
            // check if array or single string
            if (util.isArray(classes)) {
                // preserve current classes
                newclass = curr;
                
                // remove all classes
                for (i = 0; i < classes.length; i += 1) {
                    this.removeClass(classes[i]);
                }
            } else {
                remove(classes);
            }
            
            // set new classes
            this.element.className = newclass;
        };
        
        // set class(es) to node
        // removes all other classes
        Node.prototype.setClass = function (classes) {
            this.element.className = classes;
        };
        
        // toggles a class on a node
        Node.prototype.toggleClass = function (name) {
            if (this.hasClass(name)) {
                this.removeClass(name);
            } else {
                this.addClass(name);
            }
        };
        
        // css rule changes
        Node.prototype.css = function (rule, property, after) {
            var rules = rule.split("-"),
                i;
            
            // if more than one piece to rule name
            if (rules.length > 1) {
                // capitalise names after first name
                for (i = 1; i < rules.length; i += 1) {
                    rules[i] = util.capitalise(rules[i]);
                }
            }
            
            // join to form new rule
            rule = rules.join("");
            
            // get or set?
            if (typeof property === "undefined" || property === "") {
                // return computed style
                return window.getComputedStyle(this.element, null).getPropertyValue(rule);
            } else {
                this.element.style[rule] = property;
            }
            
            return this;
        };
        
        // return computed style
        Node.prototype.getComputedStyle = function (rule) {
            return window.getComputedStyle(this.element, null).getPropertyValue(rule);
        };
        
        // get parent node
        Node.prototype.parent = function () {
            if (!this.element) {
                return null;
            }
            
            return this.element.parentNode;
        };
        
        // add a child to node
        Node.prototype.addChild = function (child) {
            // check if child is an instance of class Node
            if (child.constructor === Node || child instanceof Node) {
                this.element.appendChild(child.element);
                this.children.push(child);
                return child;
            }
            
            // if is a dom element, then call add again
            if (util.isDomElement(child)) {
                child = new Node(child);
                return this.addChild(child);
            }
            
            // if is a text node just append
            if (util.isTextNode(child)) {
                this.textNodes.push(child);
                this.element.appendChild(child);
                return child;
            }
            
            // failed
            util.log(
                "error",
                this,
                "Attempt to add a child element to Node failed, " +
                    "child is not of type Node or HTMLElement."
            );
        };

        // create and add child to node
        Node.prototype.createChild = function (type, classes, id) {
            var child = new Node(type, classes, id);
            this.addChild(child);
            return child;
        };
        
        // detach from parent
        Node.prototype.detach = function () {
            return this.element.parentNode.removeChild(this.element);
        };
        
        // (re)attach to parent
        Node.prototype.attach = function () {
            this.element.parentNode.appendChild(this.element);
        };
        
        // move to another element
        Node.prototype.move = function (destination) {
            var el = this.detach();
            
            // attach to destination
            if (util.isNode(destination)) {
                destination.addChild(el);
            } else if (util.isDomElement(destination)) {
                destination.appendChild(el);
            }
        };
        
        // translate the element by (x, y)
        Node.prototype.translate = function (x, y) {
            // get current matrix settings in string form
            var currMatrix = this.css("transform"),
                matrix;
        
            if (currMatrix === "none") {
                // if no matrix found just create one
                matrix = [0, 0, 0, 0, x, y];
            } else {
                // get array of matrix
                matrix = util.matrix(currMatrix);
                
                // add x & y values to matrix
                matrix[4] = x;
                matrix[5] = y;
            }
            
            // reserialise matrix to string
            matrix = util.matrix(matrix);
            
            // apply new transformation matrix
            this.css("transform", matrix);
        };
        
        // get node x
        Node.prototype.getBounds = function (pos) {
            var bounds = this.element.getBoundingClientRect();
            
            // center of element
            if (pos === "center") {
                return util.diff(bounds.left, bounds.right) / 2;
            }
            
            return bounds[pos];
        };
        
        // delete and reset node and it's children
        Node.prototype.destroy = function () {
            var xlen = this.children.length,
                ylen = ALL_NODES.length,
                x = 0,
                y = 0;
            
            // call destroy on children
            if (xlen) {
                for (x; x < xlen; x += 1) {
                    if (this.children[x]) {
                        this.children[x].destroy();
                        this.children[x] = null;
                    }
                }
            }
            
            // remove from global node list
            if (ylen) {
                for (y; y < ylen; y += 1) {
                    if (ALL_NODES[y]) {
                        if (ALL_NODES[y].element === this.element) {
                            ALL_NODES.splice(y, 1);
                        }
                    }
                }
            }
            
            // nullify if no parent node
            if (!this.parent()) {
                this.element = null;
                return;
            }
            
            // remove from DOM by detaching from parent
            this.parent().removeChild(this.element);
        };
        
        // find occurences of an element by selector within this node
        Node.prototype.find = function (selector) {
            var nodeList = this.element.querySelectorAll(":scope " + selector),
                len = nodeList.length,
                results = [],
                i = 0;
            
            // iterate over results
            // convert to Node - will get existing
            // node if element is already a node
            for (i; i < len; i += 1) {
                results.push(new Node(nodeList[i]));
            }
            
            return results;
        };
        
        // clear a node of its children
        Node.prototype.clear = function () {
            var i = 0,
                len = this.children.length;
            
            for (i; i < len; i += 1) {
                this.children[i].destroy();
            }
        };
        
        // clone node instance and return
        Node.prototype.clone = function () {
            var clone = new Node(
                this.settings.type,
                this.getClasses(),
                this.getId()
            );
            
            // nullify the new node element and clone this
            clone.element = null;
            clone.element = this.element.cloneNode();
            
            return clone;
        };
        
        // focus on node
        Node.prototype.focus = function () {
            this.element.focus();
            return this;
        };
        
        // set attribute to node
        Node.prototype.attr = function (name, value) {
            if (typeof value === "undefined") {
                return this.element.getAttribute(name);
            }
            
            this.element.setAttribute(name, value);
            return this;
        };
        
        // write or return node text
        Node.prototype.text = function (text, clear) {
            if (typeof text === "undefined") {
                return this.element.textContent
                    || this.element.value;
            }
            
            if (clear) {
                this.element.textContent = "";
                this.element.value = "";
            }
            
            text = document.createTextNode(text);
            this.addChild(text);
            return this;
        };
        
        // set value of a node
        Node.prototype.val = function (value) {
            if (typeof value === "undefined") {
                return this.element.value;
            }
            
            this.element.value = value;
            return this;
        };
        
        // add node event handler
        Node.prototype.on = function (event, listener) {
            this.element.addEventListener(event, listener);
            return this;
        };
        
        // remove node event handler
        Node.prototype.off = function (event, listener) {
            this.element.removeEventListener(event, listener);
            return this;
        };
        
        // write node to specified element
        // mostly used when function chaining node fn's
        Node.prototype.writeTo = function (element) {
            if (typeof element === "undefined") {
                return;
            }
            
            element.appendChild(this.element);
        };
        
        // checks if node has child nodes
        Node.prototype.hasChildren = function () {
            return this.children.length;
        };
        
        // checks if the node's element matches this element
        Node.prototype.is = function (element) {
            return this.element === element;
        };
        
        // find the node which belongs to passed element
        Node.prototype.findAssociatedNode = function (element) {
            var len = ALL_NODES.length,
                i = 0;
            
            for (i; i < len; i += 1) {
                if (ALL_NODES[i].element === element) {
                    return ALL_NODES[i];
                }
            }
            
            return false;
        };
        
        // monitoring
        Node.prototype.count = function () {
            return ALL_NODES.length;
        };
        
        Node.prototype.ALL_NODES = ALL_NODES;
        
        return Node;
    }
);