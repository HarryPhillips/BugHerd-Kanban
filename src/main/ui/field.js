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
                },
                i = 0,
                len;

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
            if (type !== "select") {
                // new input field
                input = field.createChild("input",
                        "kbs-input-field kbs-input-" + type)
                    .attr("type", type)
                    .val(placeholder || "");
            } else {
                len = placeholder.length;
                
                // new select field
                input = field.createChild("select",
                        "kbs-input-field kbs-input-" + type);
                
                // add default option
                input.createChild("option")
                    .text("Please select...")
                    .attr("default");
                
                // add select options
                for (i; i < len; i += 1) {
                    input.createChild("option")
                        .text(placeholder[i].text)
                        .attr("value", placeholder[i].value);
                }
            }
            
            // check or uncheck checkbox input
            if (type === "checkbox") {
                input.on("change", function (event) {
                    handler(event.target.checked);
                    showVerify();
                });
                
                input.element.checked = placeholder;
            } else {
                // submit changes to handler
                input.on("change", function (event) {
                    handler(input.val());
                    showVerify();
                });
            }

            // manual submit
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