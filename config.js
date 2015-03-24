/*
*   @type javascript
*   @name config.js
*   @copy Copyright 2015 Harry Phillips
*/

window.define({
    appName: "kbs",
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
            state: "kbs-pinned",
            autoscroll: true,
            icons: {
                clear: "trash",
                toggle: "terminal",
                close: "times",
                destroy: "exclamation-triangle",
                example: "plus-circle"
            }
        }
    },
    events: {
        silent: true
    },
    tooltips: {
        clear: "Clear all logs",
        toggle: "Minimise / Maximise",
        close: "Close the console",
        destroy: "Destroy this console instance"
    }
});
