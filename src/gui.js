/*
*   @type javascript
*   @name gui.js
*   @auth Harry Phillips
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
        this.children = [];
    }
    
    // add a child to node
    Node.prototype.addChild = function (node) {
        // add child to node
        this.element.appendChild(node);
        this.children.push(node);
    };
    
    // create and add child to node
    Node.prototype.createChild = function (type, classes, id) {
        var node = new Node(type, classes, id);
        this.addChild(node.element);
        this.children.push(node.element);
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
        var tree = {}, main,
            conswrap, cons, consout,
            constools, consicon, getIcon, createTool,
            consminimax, consclear, consdestroy,
            consclass;

        // create nodes
        tree.main = main = new Node("div", "kbs-gui");
        main.overlay = tree.main.createChild("div", "kbs-overlay");
        
        // get icon from config
        getIcon = function (index) {
            return config.gui.console.icons[index];
        };
        
        // creates a tool widget
        createTool = function (tname) {
            consicon = getIcon(tname);
            constools[tname] = constools.createChild(
                "i",
                "fa fa-" + consicon + " kbs-tool " +
                    "kbs-" + tname
            );
            constools[tname].element.title = config.tooltips[tname] || "";
            
            return constools[tname];
        };
        
        // gui console
        if (config.logs.gui) {
            // console wrapper
            consclass = "kbs-cons-box " + config.gui.console.state;
            conswrap = main.conswrap = main.createChild("div", consclass);
            
            // console toolbar
            constools = conswrap.constools =
                conswrap.createChild("div", "kbs-cons-toolbar");
            
            // toggle tool
            createTool("minimax").element.onclick = function () {
                var classes = conswrap.element.className;
                
                if (classes.indexOf("kbs-full") === -1) {
                    conswrap.element.className += " kbs-full";
                } else {
                    conswrap.element.className =
                        conswrap.element.className.replace("kbs-full", "");
                }
            };
            
            // clear tool
            createTool("clear").element.onclick = function () {
                
            };
            
            // destroy tool
            createTool("destroy").element.onclick = function () {
                
            };
            
            // console
            conswrap.cons = cons =
                conswrap.createChild("div", "kbs-cons");
            
            // console output
            consout = cons.out = cons.createChild("div", "kbs-cons-out");
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
            "/css/font-awesome.min.css";

        // props
        mainlink.rel = "stylesheet";
        themelink.rel = "stylesheet";
        falink.rel = "stylesheet";
        
        mainlink.href = mainurl;
        themelink.href = themeurl;
        falink.href = faurl;
        
        mainlink.onload = function () {
            util.log("info", "+ main.css loaded");
        };
        
        themelink.onload = function () {
            util.log("info", "+ theme.css loaded");
        };
        
        // this will be last to load - attach the exec fn
        falink.onload = function () {
            util.log("info", "+ font-awesome.css loaded");
            
            // attach gui when styles have loaded
            document.body.appendChild(self.tree.main.element);
            util.log("info", "+ attached gui tree");
            
            // set the initialised flag
            this.inited = true;
            
            // gui is last to load - publish loaded event
            util.log("info", "+ publishing 'kbs/loaded'");
            events.publish("kbs/loaded");
        };
        
        // write out to document
        document.head.appendChild(falink);
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
                events.subscribe("gui/log", this.writeLog);
            }
        }
    };
    
    // write a log to console out
    GUI.prototype.writeLog = function (args) {
        // get nodes using the self pointer!
        var out = self.tree.main.conswrap.cons.out.element,
            log = new Node("div", "kbs-log-node kbs-" + args.type),
            content = args.msg;
        
        if (args.obj) {
            args.obj.replace();
            content += "<pre class='kbs-object'>";
            content += args.obj + "</pre>";
        }
        
        log.element.innerHTML = content;
        
        // write
        out.appendChild(log.element);
        
        // refresh
        self.refresh();
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
    GUI.Console = function () {
        this.tree = this.buildNodeTree();
        this.children = [];
    };
    
    // expose / return gui module
    
    self = new GUI();
    
    return self;
});
