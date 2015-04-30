/*
*   @type javascript
*   @name config.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define({
    appName: "kbs",
    appFullname: "Kanban",
    version: "1.2.0",
    enabled: true,
    mode: "prod",
//    offline: true,
    httpToken: "Fw43Iueh87aw7",
//    theme: "black",
//    test: true,
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
