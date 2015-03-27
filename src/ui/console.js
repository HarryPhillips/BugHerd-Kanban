/*
*   @type javascript
*   @name console.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    [
        'config',
        'src/util',
        'src/components/events',
        'src/components/http',
        'src/components/status',
        'src/ui/node',
        'src/ui/modal'
    ],
    function (config, util, events, Http, status, Node, Modal) {
        'use strict';
        
        // instance pointers
        var self, gui;
        
        // console constructor
        function Console(instance) {
            // check if gui logging is enabled
            if (!config.logs.gui) {
                return;
            }
            
            // set a self pointer to this
            self = this;
            
            // make sure we have a gui instance
            if (typeof instance === "undefined") {
                throw new Error("No GUI instance passed to Console");
            }
            
            // set gui and build the tree
            gui = instance;
            this.buildNodeTree();
            
            // update console status
            events.publish("kbs/status", {
                component: "console",
                status: true
            });
        }
        
        // console output
        Console.prototype.write = function (args) {
            // get nodes using the self pointer!
            var out = self.wrapper.cons.out.element,
                log = new Node("div", "kbs-log-node kbs-" + args.type),
                txt = document.createTextNode(args.msg),
                objwrap = new Node("pre", "kbs-object"),
                objexp = new Node("i", "fa fa-" +
                      config.gui.console.icons.expand +
                      " kbs-object-expand"),
                objtxt,
                i = 0;

            // write message to log node
            log.addChild(txt);
            
            // write object to log node
            if (args.obj) {
                objtxt = document.createTextNode(args.obj);
                objexp.element.setAttribute("onclick",
                                            "kbsExpandObjectNode(this)");
                objwrap.addChild(objexp.element);
                objwrap.addChild(objtxt);
                log.addChild(objwrap.element);
            }

            // write to output
            out.appendChild(log.element);

            // refresh
            self.refresh();
        };
        
        // create toolbar widget
        Console.prototype.createTool = function (toolbar, tool) {
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
        
        // get toolbar widget icon from config
        Console.prototype.getIcon = function (tool) {
            return config.gui.console.icons[tool] || "plus";
        };
        
        // open console
        Console.prototype.open = function () {
            var element = this.wrapper.element,
                classes = element.className;

            element.className = classes.replace(" kbs-close", " kbs-open");
        };
        
        // close console
        Console.prototype.close = function () {
            var element = this.wrapper.element,
                classes = element.className;

            element.className = classes.replace(" kbs-open", " kbs-close");
        };
        
        // shrink console
        Console.prototype.shrink = function () {};
        
        // make console fullscreen
        Console.prototype.full = function () {};
        
        // refresh console
        Console.prototype.refresh = function () {
            // scroll to bottom of console
            var cons = self.wrapper.cons.element;
            cons.scrollTop = cons.scrollHeight;
        };
         
        // clear output
        Console.prototype.clear = function () {
            var cons = this.wrapper.cons.element,
                out = this.wrapper.cons.out.element,
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
        
        // save the output buffer to a text file on the local system
        Console.prototype.save = function (filename) {
            // declarations
            var time = util.ftime(),
                date = util.fdate(),
                file = "log_" + date + "_" + time,
                
                // setup request
                req = new Http({
                    url: "http://localhost/GitHub/Kanban/temp.php",
                    send: true,
                    data: {
                        date: date,
                        time: time,
                        file: file
                    },
                    success: function (response) {
                        util.log("okay", response, "Save Response:");
                    }
                });
        };
        
        // destroy console instance (irreversible)
        Console.prototype.destroy = function () {
            var
                modalTitle = "Destroy the Console instance?",
                
                modalMsg = "Confirm destruction of the GUI Console " +
                "(irreversible).",
                
                modal = new Modal("prompt", gui, {
                    init: true,
                    title: modalTitle,
                    message: modalMsg,
                    confirm: function () {
                        var parent = self.wrapper.element.parentNode,
                            child = self.wrapper.element;
                        
                        // destroy console node
                        parent.removeChild(child);
                        
                        modal.close();
                    },
                    cancel: function () {
                        modal.close();
                    }
                });
        };
        
        // build the console
        Console.prototype.buildNodeTree = function () {
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
            this.wrapper = wrapper = gui.createChild("div", consclass);

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
                    self.open();
                }
            };
            
            // save tool
            this.createTool(constools, "save").element.onclick = function () {
                self.save();
            };

            // destroy tool
            this.createTool(constools, "destroy").element.onclick = function () {
                self.destroy();
            };

            // clear tool
            this.createTool(constools, "clear").element.onclick = function () {
                self.clear();
            };

            // close tool
            this.createTool(constools, "close").element.onclick = function () {
                self.close();
            };

            // console
            wrapper.cons = cons =
                wrapper.createChild("div", "kbs-cons");

            // console output
            consout = cons.out = cons.createChild("div", "kbs-cons-out");

            // return wrapper element
            return wrapper;
        };
        
        return Console;
    }
);