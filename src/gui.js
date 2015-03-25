/*
*   @type javascript
*   @name gui.js
*   @copy Copyright 2015 Harry Phillips
*/

/*jslint devel: true */

/*
    TODO:
    
    - Add an array to Node class to store child nodes
    - Add ability to remove child nodes
    - Re-write to support the new node tree structure
*/

window.define(['config', './util', './events'], function (config, util, events) {
    'use strict';
    
    util.log("+ gui.js loaded");

    // points to the gui instance
    // used inside functions called externally
    // that need access to the the gui instance
    var self;
    
    /* node constructor
    --------------------------------------------------------------------------*/
    function Node(type, classes, id) {
        this.element = document.createElement(type);
        this.element.className = classes || "";
        this.element.id = id || "";
    }
    
    // add a child to node
    Node.prototype.addChild = function (node) {
        // add child to node
        this.element.appendChild(node);
    };
    
    // create and add child to node
    Node.prototype.createChild = function (type, classes, id) {
        var node = new Node(type, classes, id);
        this.addChild(node.element);
        return node;
    };
    
    /* gui constructor
    --------------------------------------------------------------------------*/
    function GUI() {
        this.inited = false;
        this.tree = this.buildNodeTree();
        this.nodes = {};
    }
    
    // build gui node tree
    GUI.prototype.buildNodeTree = function () {
        // create tree and nodes
        var tree = {}, main;

        // create nodes
        tree.main = main = new Node("div", "kbs-gui");
        main.overlay = tree.main.createChild("div", "kbs-overlay");
        
        // gui console
        if (config.logs.gui) {
            this.console = new GUI.Console(main);
        }

        return tree;
    };
    
    // initialise gui
    GUI.prototype.init = function () {
        var
            // create link elements
            mainlink = document.createElement("link"),
            themelink = document.createElement("link"),
            falink = document.createElement("link"),
            
            // create urls
            mainurl = window.KBS_BASE_URL + window.KBS_SRC_DIR +
            "css/main.css",
            
            themeurl = window.KBS_BASE_URL + window.KBS_SRC_DIR +
            "css/theme.css",
            
            faurl = "//maxcdn.bootstrapcdn.com/font-awesome/" +
            "4.3.0" +
            "/css/font-awesome.min.css",
            
            // attach gui element and publish loaded event
            publish = function () {
                // attach gui when styles have loaded
                document.body.appendChild(self.tree.main.element);
                util.log("debug", "+ attached gui tree");

                // set the initialised flag
                self.inited = true;

                // gui is always last to load - publish loaded event
                util.log("debug", "+ publishing 'kbs/loaded'");
                events.publish("kbs/loaded");
            };

        // props
        mainlink.rel = "stylesheet";
        themelink.rel = "stylesheet";
        falink.rel = "stylesheet";
        
        mainlink.href = mainurl;
        themelink.href = themeurl;
        falink.href = faurl;
        
        mainlink.onload = function () {
            util.log("okay", "+ main.css loaded");
        };
        
        themelink.onload = function () {
            util.log("okay", "+ theme.css loaded");
            
            if (config.offline) {
                publish();
            }
        };
        
        // this will be last to load - attach the exec fn
        falink.onload = function () {
            util.log("okay", "+ font-awesome.css loaded");
            
            if (!config.offline) {
                publish();
            }
        };
        
        // write out to document
        if (!config.offline) {
            document.head.appendChild(falink);
        }
        document.head.appendChild(mainlink);
        document.head.appendChild(themelink);

        // events setup
        if (config.gui.enabled) {
            if (config.gui.autorefresh) {
                // auto refresh
                events.subscribe("gui/update", this.refresh);
            }
            
            if (config.logs.gui) {
                // gui logging
                events.subscribe("gui/log", this.console.write);
            }
        }
    };
    
    // benchmarks the generation of 10000 log nodes
    GUI.prototype.benchmark = function () {
        var cons = this.tree.main.conswrap.cons.element,
            out = this.tree.main.conswrap.cons.out.element,
            start = new Date().getTime(),
            end,
            i = 0;
        
        // detach
        cons.removeChild(out);
        
        while (i < 10000) {
            util.log("debug", "log #" + i);
            i += 1;
        }
        
        // reattach
        cons.appendChild(out);
        
        end = new Date().getTime() - start;
        util.log("debug", "opt: " + end + "ms");
    };
    
    // add a child node to the gui
    GUI.prototype.addChild = function (node) {
        this.tree.main.element.appendChild(node);
    };
    
    // create a child and add to the gui
    GUI.prototype.createChild = function (type, classes, id) {
        var node = new Node(type, classes, id);
        this.tree.main.element.appendChild(node);
        return node;
    };
    
    // refresh the gui and its child nodes
    GUI.prototype.refresh = function () {
        var tree = this.tree,
            cons = tree.main.conswrap.cons.element;
        
        // update console scroll
        if (config.gui.console.autoscroll) {
            cons.scrollTop = cons.scrollHeight;
        }
    };
    
    /* gui console constructor
    --------------------------------------------------------------------------*/
    GUI.Console = function (gui) {
        this.tree = this.buildNodeTree(gui);
    };
    
    // write log to console
    GUI.Console.prototype.write = function (args) {
        // get nodes using the self pointer!
        var out = self.tree.main.conswrap.cons.out.element,
            log = new Node("div", "kbs-log-node kbs-" + args.type),
            content = args.msg,
            i = 0;
        
        // object node
        if (args.obj) {
            content += "<pre class='kbs-object'>";
            content += args.obj + "</pre>";
        }
        
        log.element.innerHTML = content;
        
        // write
        out.appendChild(log.element);
        
        // refresh
        self.refresh();
    };
    
    // clear console
    GUI.Console.prototype.clear = function () {
        var cons = this.tree.cons.element,
            out = this.tree.cons.out.element,
            start = new Date().getTime(),
            end;
        
        // detach
        cons.removeChild(out);
        
        // remove all logs
        while (out.firstChild) {
            out.removeChild(out.firstChild);
        }
        
        // reattach
        cons.appendChild(out);
        
        // bench
        end = new Date().getTime() - start;
        util.log("okay", "cleared all logs in " + end + " ms");
    };
    
    // close console
    GUI.Console.prototype.close = function () {
        var element = this.tree.element,
            classes = element.className;
        
        util.log(this.tree);
        
        element.className = classes += " kbs-close";

        util.log(this.tree);
        
        this.tree.constools.constitle.element.style.display = "none";
    };
    
    // open console
    GUI.Console.prototype.open = function () {
        var element = this.tree.element,
            classes = element.className;
        
        element.className = classes.replace(" kbs-close", "");
        
        console.log(this.tree.constools.constitle.element);
        this.tree.constools.constitle.element.style.display = "block";
    };
    
    // destroy the console instance
    GUI.Console.prototype.destroy = function () {
        var confirm = window.prompt("Are you sure you want to destroy the " +
                "console instance? You will have to refresh the page " +
                "to recover it.",
                "Click OK or CANCEL - input not needed");
        
        if (confirm) {
            self.tree.main.element.removeChild(self.tree.main.conswrap.element);
        }
    };
    
    // create a new console tool
    GUI.Console.prototype.createTool = function (toolbar, tool) {
        if (typeof toolbar === "undefined") {
            throw new Error("No toolbar passed to " +
                            "GUI.Console.createTool()");
        }
        
        var icon;
        
        icon = this.getIcon(tool);
        toolbar[tool] = toolbar.createChild(
            "i",
            "fa fa-" + icon + " kbs-tool " +
                "kbs-" + tool
        );
        toolbar[tool].element.title = config.tooltips[tool] || "";

        return toolbar[tool];
    };
    
    // returns icon config setting for a given tool
    GUI.Console.prototype.getIcon = function (tool) {
        return config.gui.console.icons[tool] || "plus";
    };
    
    // build console node tree and return
    GUI.Console.prototype.buildNodeTree = function (gui) {
        // check we were given a parent
        if (typeof gui === "undefined") {
            throw new Error("No parent given to GUI.Console constructor");
        }
        
        // declarations
        var
            // console nodes
            wrapper,
            consclass,
            constools,
            constitle,
            titlenode,
            cons,
            consout,
            consicon;
        
        // console wrapper
        consclass = "kbs-cons-box " + config.gui.console.state;
        wrapper = gui.conswrap = gui.createChild("div", consclass);

        // console toolbar
        constools = wrapper.constools =
            wrapper.createChild("div", "kbs-cons-toolbar");
        
        // add a title to the toolbar
        constitle = constools.constitle =
            constools.createChild("div", "kbs-cons-title");
        
        titlenode = document.createTextNode("Kanban v" + config.version);
        constitle.element.appendChild(titlenode);

        // toggle tool
        this.createTool(constools, "toggle").element.onclick = function () {
            var classes = wrapper.element.className,
                closed = classes.indexOf("kbs-close") !== -1,
                full = classes.indexOf("kbs-full") !== -1;

            // if not closed and not full screen
            if (!closed && !full) {
                // make full screen
                wrapper.element.className += " kbs-full";
            }
            
            // if in full screen
            if (full) {
                // shrink
                wrapper.element.className =
                    wrapper.element.className.replace(" kbs-full", "");
            }
            
            // if closed
            if (closed) {
                // open
                self.console.open();
            }
        };
        
        // destroy tool
        this.createTool(constools, "destroy").element.onclick = function () {
            self.console.destroy();
        };

        // clear tool
        this.createTool(constools, "clear").element.onclick = function () {
            self.console.clear();
        };

        // close tool
        this.createTool(constools, "close").element.onclick = function () {
            self.console.close();
        };

        // console
        wrapper.cons = cons =
            wrapper.createChild("div", "kbs-cons");

        // console output
        consout = cons.out = cons.createChild("div", "kbs-cons-out");
        
        // return wrapper element
        return wrapper;
    };
    
    // expose / return gui instance
    self = new GUI();
    return self;
});
