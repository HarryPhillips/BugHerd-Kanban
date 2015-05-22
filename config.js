/*
*   @type javascript
*   @name config.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true, clone: true */

define(function () {
    'use strict';
    
    // self references the instantiated config class
    // pointer references the config object
    var self, pointer;
    
    // config class
    function Config(obj) {
        // set reference to this instance
        self = this;
        
        this.defaultObj = clone(obj);
        this.defaultObj.reset = this.reset;
        obj.reset = this.reset;
        
        this.obj = obj;
        pointer = this.obj;
    }
    
    // set config to default values
    Config.prototype.reset = function () {
        // iterate and check each property
        var i;
        for (i in self.obj) {
            if (self.obj.hasOwnProperty(i)) {
                // is a default prop?
                if (!self.defaultObj[i]) {
                    // this is a new prop - unset it
                    delete self.obj[i];
                }
                
                // set to default
                self.obj[i] = self.defaultObj[i];
            }
        }
    };
    
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
    
    // construct the config instance once only
    pointer = pointer || new Config({
        appName: "kbs",
        appFullname: "Kanban",
        version: "1.3.0",
        enabled: true,
        mode: "dev",
//        offline: true,
        httpToken: "Fw43Iueh87aw7",
        theme: "default",
        test: false,
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
            wallpaper: "",
            parallax: {
                enabled: false,
                factor: 100
            },
            console: {
                state: "kbs-closed",
                autoscroll: true,
                destroyed: false,
                icons: {
                    save: "file-text",
                    clear: "trash",
                    toggle: "terminal",
                    close: "times",
                    destroy: "unlink",
                    example: "plus-circle",
                    benchmark: "tachometer",
                    settings: "cogs",
                    expand: "caret-square-o-right",
                    toggleObjs: "list-alt"
                },
                benchmark: {
                    amount: 10000
                }
            },
            modals: {
                behaviour: {
                    modalHopping: true
                }
            }
        },
        interactor: {
            enabled: true,
            observe: false,
            expandOnclick: true
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
            benchmark: "Run the benchmark",
            settings: "Edit Kanban settings",
            toggleObjs: "Toggle object logs display"
        }
    }).obj;
    
    // return the instance
    return pointer;
});
