/*
*   @type javascript
*   @name field.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    [
        'main/components/node'
    ],
    function (
        Node
    ) {
        'use strict';
        
        // field class
        function Field(text, type, handler, placeholder) {
            var field = new Node("div", "kbs-field"),
                label,
                input,
                submit,
                verify;

            // label
            label = field.createChild("span", "kbs-label")
                .text(text);

            // input
            input = field.createChild("input", "kbs-input-field")
                .attr("type", type)
                .val(placeholder || "");

            // submit
            submit = field.createChild("span", "kbs-confirm")
                .text("set")
                .on("click", function () {
                    handler(input.val());
                    verify.fadeIn("fast");
                    setTimeout(function () {
                        verify.fadeOut("slow");
                    }, 1200);
                });

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