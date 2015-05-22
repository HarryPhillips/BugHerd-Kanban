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
        
        // node constructor
        function Node(type, classes, id) {
            this.children = [];
            
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
        };
        
        // hide node
        Node.prototype.hide = function () {
            this.element.style.display = "none";
        };
        
        // fade in node
        Node.prototype.fadeIn = function (args) {
            if (typeof window.jQuery === "undefined") {
                this.show();
            }
            
            // jquery fade in
            window.jQuery(this.element).fadeIn(args);
        };
        
        // fade out node
        Node.prototype.fadeOut = function (args) {
            if (typeof window.jQuery === "undefined") {
                this.hide();
                return;
            }
            
            // jquery fade out
            window.jQuery(this.element).fadeOut(args);
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
                    remove(classes[i]);
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
        
        // css rule changes
        Node.prototype.css = function (rule, property) {
            var rules = rule.split("-"),
                i;
            
            // if more than one piece to rule name
            if (rules.length > 1) {
                // capitilise names after first name
                for (i = 1; i < rules.length; i += 1) {
                    rules[i] = util.capitilise(rules[i]);
                }
            }
            
            // join to form new rule
            rule = rules.join("");
            
            // set 
            this.element.style[rule] = property;
        };
        
        // get parent node
        Node.prototype.parent = function () {
            return this.element.parentNode;
        };
        
        // add a child to node
        Node.prototype.addChild = function (child) {
            // check if node is an instance of class Node
            if (child.constructor === Node || child instanceof Node) {
                this.element.appendChild(child.element);
                this.children.push(child);
                return;
            }
            
            // if is a dom element, create new node and push
            // to children
            if (util.isDomElement(child)) {
                this.children.push(new Node(child));
            }

            // append
            this.element.appendChild(child);
        };

        // create and add child to node
        Node.prototype.createChild = function (type, classes, id) {
            var child = new Node(type, classes, id);
            this.addChild(child);
            return child;
        };
        
        // detach from parent
        Node.prototype.detach = function () {
            this.element.parentNode.removeChild(this.element);
        };
        
        // (re)attach to parent
        Node.prototype.attach = function () {
            this.element.parentNode.appendChild(this.element);
        };
        
        // delete and reset node and it's children
        Node.prototype.destroy = function () {
            this.parent().removeChild(this.element);
            this.element = null;
        };
        
        // find a child element within our element tree
        Node.prototype.find = function (selector) {
            var nodeList = this.element.querySelectorAll(":scope > " + selector),
                len = nodeList.length,
                results = [],
                i = 0;
            
            // convert to node
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
        
        // Node event listeners
        Node.prototype.on = function (event, listener) {
            this.element.addEventListener(event, listener);
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
        
        return Node;
    }
);