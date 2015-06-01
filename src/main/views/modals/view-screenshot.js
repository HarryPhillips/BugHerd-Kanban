/*
*   @type javascript
*   @name view-screenshot.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    [
        'main/components/util',
        'main/ui/node',
        'main/ui/view'
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
            
            // screenshot zooming
            //TODO(harry): Check for existing matrix data then amend
            wrap.on("DOMMouseScroll", function (e) {
                var existing = util.matrix(img.css("transform")),
                    dir = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail))) / 20,
                    scale = img.css("transform"),
                    delta = util.matrix(scale)[0] + dir;
                
                // apply scale to image
                img.css("transform", "scale(" + delta + ")");
                
                // move image to keep centred
                img.css("margin-top", -((delta * 100) + (100 * delta)) + "px");
            });
            
            // screenshot dragging
            wrap.on("mousedown", function (e) {
                e.stopPropagation();
                e.preventDefault();
                
                // mousemove/dragging handler
                var ondrag = function (e) {
                    var deltaX = (img.getBounds("left") / 3) + (e.clientX / 10),
                        deltaY = (img.getBounds("top") / 3) + (e.clientY / 10);
                    
                    img.translate(deltaX, deltaY);
                    
                    return false;
                };
                
                // on mousemove - move the image
                wrap.on("mousemove", ondrag);
                
                // on mouseup - remove drag handler
                wrap.on("mouseup", function () {
                    wrap.off("mousemove", ondrag);
                    return false;
                });
                
                return false;
            });
            
            // destroy the modal when it is closed
            modal.on("close", modal.destroy);
            
            return node;
        });

        return view;
    }
);