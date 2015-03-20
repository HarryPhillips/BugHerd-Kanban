/*
*   @type javascript
*   @name config.js
*   @auth Harry Phillips
*/

window.define({
    appName: "kbs",
    enabled: true,
    mode: "dev",
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
                minimax: "caret-square-o-up",
                destroy: "times",
                example: "plus-circle"
            }
        }
    },
    events: {
        silent: true
    },
    tooltips: {
        clear: "Clear all logs from the console.",
        destroy: "Close the console.",
        minimax: "Minimse / Maximise the console."
    }
});
