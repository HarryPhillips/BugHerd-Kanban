/*
*   @type javascript
*   @name config.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true, clone: true */

define(function () {
    "use strict";
    
    var instance;
    
    // config class
    function Config(obj) {
        this.defaults = clone(obj);
        this.state = obj;
        this.state.reset = this.reset;
    }
    
    // reset to initial/default state
    Config.prototype.reset = function () {
        this.state = clone(this.defaults);
        this.state.reset = this.reset;
    };
    
    // construct a single config instance
    // with these default values
    instance = new Config({
        appName: "kbs",
        appFullname: "Kanban",
        version: "1.2.2",
        enabled: true,
        mode: "dev",
//            offline: true,
        httpToken: "Fw43Iueh87aw7",
//            theme: "black",
//            test: true,
        logs: {
            enabled: true,
            gui: true,
            contexts: true,
            contextFlag: "context:",
            obj2buffer: false,
            filter: false
        },
        gui: {
            enabled: true,
            autorefresh: true,
            console: {
                state: "kbs-close",
                autoscroll: true,
                icons: {
                    save: "file-text",
                    clear: "trash",
                    toggle: "terminal",
                    close: "times",
                    destroy: "unlink",
                    example: "plus-circle",
                    benchmark: "tachometer",
                    expand: "caret-square-o-right"
                }
            }
        },
        interactor: {
            enabled: true
        },
        events: {
            silent: false
        },
        cookies: {
            enabled: true,
            prefix: "__kbs_"
        },
        routes: {
            console: {
                save: "endpoint/SaveBuffer.php"
            }
        },
        tooltips: {
            save: "Save the output buffer to text file",
            clear: "Clear all logs",
            toggle: "GUI Console State",
            close: "Close the console",
            destroy: "Destroy this console instance",
            benchmark: "Run the benchmark"
        }
    });
    
    // internal cloning function
    function clone(obj) {
        var copy,
            attr,
            len,
            i;
            
        // handle dates
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // handle arrays
        if (obj instanceof Array) {
            copy = [];
            len = obj.length;
            i = 0;

            // recursive copy
            for (i; i < len; i += 1) {
                copy[i] = clone(obj[i]);
            }

            return copy;
        }

        // handle objects
        if (obj instanceof Object) {
            copy = {};

            // recursive copy
            for (attr in obj) {
                if (obj.hasOwnProperty(attr)) {
                    copy[attr] = clone(obj[attr]);
                }
            }

            return copy;
        }

        // handle simple types
        if (typeof obj === "string"
                || typeof obj === "number"
                || typeof obj === "boolean") {
            copy = obj;
            return copy;
        }
    }
    
    return instance.state;
});
