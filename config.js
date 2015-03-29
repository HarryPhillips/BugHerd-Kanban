/*
*   @type javascript
*   @name config.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define({
    appName: "kbs",
    version: 0.9,
    enabled: true,
    mode: "dev",
    offline: false,
    test: false,
    logs: {
        enabled: true,
        gui: true,
        filter: false
    },
    gui: {
        enabled: true,
        autorefresh: true,
        console: {
            state: "kbs-open",
            autoscroll: true,
            icons: {
                save: "file-text",
                clear: "trash",
                toggle: "terminal",
                close: "times",
                destroy: "unlink",
                example: "plus-circle",
                expand: "caret-square-o-right"
            }
        }
    },
    events: {
        silent: false
    },
    routes: {
        console: {
            save: "kanban/endpoint/console/save.php"
        }
    },
    tooltips: {
        save: "Save the output buffer to text file",
        clear: "Clear all logs",
        toggle: "GUI Console State",
        close: "Close the console",
        destroy: "Destroy this console instance"
    }
});
