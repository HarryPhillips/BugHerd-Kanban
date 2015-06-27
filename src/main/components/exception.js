/*
*   @type javascript
*   @name exception.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(["main/components/util"], function (util) {
    "use strict";

    function Exception(err, msg) {
        this.fileName = err.fileName;
        this.lineNumber = err.lineNumber;
        this.message = err.message;

        util.log(
            "error",
            msg + " | Exception thrown in " +
                err.fileName + " at line " +
                err.lineNumber + ". Error: " +
                err.message
        );
    }

    return Exception;
});
