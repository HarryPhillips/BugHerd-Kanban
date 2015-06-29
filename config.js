/*
*   @type javascript
*   @name config.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true, clone: true */

define({
    appName: "kbs",
    appFullname: "Kanban",
    version: "1.4.0",
    enabled: true,
    mode: "dev",
//  offline: true,
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
        severityStyles: true,
        parallax: {
            enabled: false,
            factor: 100
        },
        console: {
            state: "kbs-closed",
            autoscroll: true,
            allowDestruction: false,
            destroyed: false,
            displayed: true,
            icons: {
                menu: "bars",
                toggle: "terminal",
                save: "file-text",
                clear: "trash",
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
                stack: true,
                shift: true
            }
        }
    },
    interactor: {
        enabled: true,
        observe: false,
        expandOnclick: true,
        filters: {
            metadata: {},
            clientdata: {}
        }
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
        save: "Save log buffer",
        clear: "Clear console",
        menu: "Kanban Menu",
        toggle: "Toggle the console",
        close: "Close",
        destroy: "Destroy console",
        benchmark: "Benchmark",
        settings: "Settings",
        toggleObjs: "Toggle object logs"
    }
});
