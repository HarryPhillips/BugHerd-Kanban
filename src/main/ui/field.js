/*
*   @type javascript
*   @name field.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    [
        'main/components/util',
        'main/ui/node'
    ],
    function (
        util,
        Node
    ) {
        'use strict';
        
        // field class
        function Field(text, type, handler, placeholder) {
            var field = new Node("div", "kbs-field"),
                label,
                input,
                submit,
                verify,
                showVerify = function () {
                    verify.fadeIn("fast");
                    setTimeout(function () {
                        verify.fadeOut("slow");
                    }, 1200);
                };

            // title
            if (type === "title") {
                label = field.createChild("h5", "kbs-title")
                    .text(text);
                
                return field;
            }
            
            // label
            label = field.createChild("span", "kbs-label")
                .text(text);

            // input
            input = field.createChild("input",
                    "kbs-input-field kbs-input-" + type)
                .attr("type", type)
                .val(placeholder || "");
            
            // check or uncheck checkbox input
            if (type === "checkbox") {
                input.on("change", function (event) {
                    handler(event.target.checked);
                    showVerify();
                });
                
                input.element.checked = placeholder;
            }

            // submit
            if (type !== "checkbox") {
                submit = field.createChild("span", "kbs-confirm")
                    .text("set")
                    .on("click", function () {
                        handler(input.val());
                        showVerify();
                    });
            }

            // verify submission icon
            verify = field.createChild(
                "i",
                "fa fa-check kbs-field-verified"
            );

            return field;
        }
        
        return Field;
    }
);