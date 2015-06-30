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
                body,
                img,
                guides,
                updateGuides,
                wb,
                hb;

            // modal title
            node.title = params.title + " for task #" + params.id;

            // body node
            body = new Node(document.body);

            // screenshot wrapper
            wrap = node.createChild("div", "kbs-screenshot-wrap");

            // screenshot
            img = wrap.createChild("img", "kbs-screenshot")
                .attr("src", params.url)
                .css("width", "auto")
                .css("height", "auto");

            // screenshot guides
            guides = {
                top: wrap.createChild("div", "kbs-ln-horiz"),
                bottom: wrap.createChild("div", "kbs-ln-horiz"),
                left: wrap.createChild("div", "kbs-ln-verti"),
                right: wrap.createChild("div", "kbs-ln-verti")
            };

            // add badges to guidelines
            wb = guides.bottom.addChild(new Node("div", "", "kbs-ss-width"));
            hb = guides.right.addChild(new Node("div", "", "kbs-ss-height"));

            // guide update fn
            updateGuides = function () {
                var i, bounds, offset,
                    width, height;

                // update guideline position
                for (i in guides) {
                    if (guides.hasOwnProperty(i)) {
                        bounds = img.getBounds(i);

                        // set x axis guides
                        if (i.match(/(left)|(right)/)) {
                            offset = wrap.getBounds("left");
                            guides[i].css(
                                "left",
                                bounds - offset + "px"
                            );
                        }

                        // set y axis guides
                        if (i.match(/(top)|(bottom)/)) {
                            offset = wrap.getBounds("top");
                            guides[i].css(
                                "top",
                                bounds - offset + "px"
                            );
                        }
                    }
                }

                // have to manually compute width and height
                // transformed elements do not report back
                // a correct computed style value
                width = util.diff(
                    parseInt(guides.left.css("left"), 10),
                    parseInt(guides.right.css("left"), 10)
                );

                height = util.diff(
                    parseInt(guides.top.css("top"), 10),
                    parseInt(guides.bottom.css("top"), 10)
                );

                // apply values
                wb.text(width + "px", true);
                hb.text(height + "px", true);

                // apply position to height badge
                hb.css(
                    "top",
                    (img.getBounds("top") - wrap.getBounds("top")) +
                        (height / 2) - (parseInt(
                            hb.getComputedStyle("height"),
                            10
                        ) / 2) + "px"
                );

                // apply position to width badge
                wb.css(
                    "left",
                    img.getBounds("left") - wrap.getBounds("left") +
                        (width / 2) - (parseInt(
                            wb.getComputedStyle("width"),
                            10
                        ) / 2) + "px"
                );
            };

            // screenshot zooming
            wrap.on("DOMMouseScroll", function (e) {
                var curr, dirfact, scale,
                    delta, sf, tfx, tfy,
                    matrix, bsize,
                    bounds = img.getBounds.bind(img);

                // existing matrix array
                curr = util.matrix(img.css("transform"));
                // scale factor
                sf = 20;
                // scaling factor and direction
                dirfact = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail))) / sf;
                // get scale from matrix (2d scale is always 1st/4th index)
                scale = curr[0];
                // delta amount
                delta = scale + dirfact;
                // new transformation matrix
                matrix = [delta, curr[1], curr[2], delta, curr[4], curr[5]];

                // apply transformation matrix
                img.css("transform", util.matrix(matrix));

                // update guidelines
                updateGuides();
            });

            // screenshot dragging
            wrap.on("mousedown", function (e) {
                var ondrag, dirX = 0, dirY = 0,
                    clickX = e.clientX,
                    clickY = e.clientY;

                // stop bubbling and prevent default behaviour
                e.stopPropagation();
                e.preventDefault();

                // add grabber class
                wrap.addClass("kbs-grabbed");

                // mousemove/dragging handler
                ondrag = function (e) {
                    var curr, deltaX, deltaY;

                    // current transformation matrix
                    curr = util.matrix(img.css("transform"));

                    // distance travelled in x & y
                    deltaX = (clickX - e.clientX);
                    deltaY = (clickY - e.clientY);

                    // invert delta values
                    // this way dragging feels more natural
                    deltaX = -(deltaX);
                    deltaY = -(deltaY);

                    // add the existing tx & ty values onto delta
                    deltaX += curr[4];
                    deltaY += curr[5];

                    // move to new location
                    img.translate(deltaX, deltaY);
                    wrap.css("background-position", deltaX + "px " + deltaY + "px");

                    // set new click locations
                    clickX = e.clientX;
                    clickY = e.clientY;

                    // update guidelines
                    updateGuides();

                    // return false to further
                    // prevent default behaviour
                    return false;
                };

                // on mousemove - move the image
                body.on("mousemove", ondrag);

                // on mouseup - remove drag handler
                body.on("mouseup", function () {
                    body.off("mousemove", ondrag);
                    wrap.removeClass("kbs-grabbed");
                    return false;
                });

                return false;
            });

            // destroy the modal when it is closed
            modal.on("close", modal.destroy);

            // initial guide update
            updateGuides();

            return node;
        });

        return view;
    }
);
