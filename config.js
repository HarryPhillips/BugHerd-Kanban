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
                toggle: "caret-square-o-up",
                close: "times",
                example: "plus-circle"
            }
        }
    },
    events: {
        silent: true
    },
    tooltips: {
        clear: "Clear all logs",
        close: "Close the console",
        toggle: "Minimise / Maximise"
    }
});
