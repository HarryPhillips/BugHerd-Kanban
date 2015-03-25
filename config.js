/*
*   @type javascript
*   @name config.js
*   @copy Copyright 2015 Harry Phillips
*/

window.define({
    appName: "kbs",
    version: 0.7,
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
            state: "kbs-close",
            autoscroll: true,
            icons: {
                save: "file-text",
                clear: "trash",
                toggle: "terminal",
                close: "times",
                destroy: "exclamation-triangle",
                example: "plus-circle",
                expand: "caret-square-o-right"
            }
        }
    },
    events: {
        silent: false
    },
    tooltips: {
        save: "Save the output buffer to text file",
        clear: "Clear all logs",
        toggle: "Minimise / Maximise",
        close: "Close the console",
        destroy: "Destroy this console instance"
    }
});
