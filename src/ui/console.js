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
        'src/components/router',
        'src/components/cache',
        'src/components/node',
        'src/ui/modal'
    ],
    function (
        config,
        util,
        events,
        Http,
        status,
        router,
        cache,
        Node,
        Modal
    ) {
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
            
            // log contexts
            this.setContexts();
            
            // update console status
            events.publish("kbs/status", {
                component: "console",
                status: true
            });
        }
        
        // console logging contexts
        Console.prototype.setContexts = function () {
            // make sure not to overwrite existing
            if (this.contexts) {
                return;
            }
            
            // set log context array
            this.contexts = {
                def: self.wrapper.cons.out.element
            };
        };
        
        // get a logging context
        Console.prototype.getContext = function (context) {
            if (!config.logs.contexts) {
                return this.contexts.def;
            }
            
            return this.contexts[context];
        };
        
        // add a logging context
        Console.prototype.createContext = function (context, element) {
            // return if disabled
            if (!config.logs.contexts) {
                return;
            }
            
            // declarations
            var logContext;
            
            // make sure not already defined
            if (this.contexts[context]) {
                util.log("error", "Log context: '" + context +
                         "' is already defined");
            }
            
            if (util.isNode(element)) {
                // use create proto of Node
                logContext = element.createChild("div", "kbs-log-context", context);
            } else {
                // manually append new Node
                logContext = new Node("div", "kbs-log-context", context);
                element.appendChild(logContext.element);
            }
            
            // apply to global contexts
            this.contexts[context] = logContext.element;
            
            return element;
        };
        
        // console output
        Console.prototype.write = function (args) {
            // declarations
            var context = self.getContext("def"),
                contextParent,
                
                log = new Node("div", "kbs-log-node kbs-" + args.type),
                txt = document.createTextNode(args.msg),
                
                objwrap = new Node("pre", "kbs-object"),
                objexp = new Node("i", "fa fa-" +
                      self.getIcon("expand") +
                      " kbs-object-expand"),
                objtxt,
                
                doCreateContext = false,
                i = 0;
            
            // check for context param
            if (args.context) {
                // check for subcontext
                if (args.subcontext) {
                    // check if subcontext exists
                    if (self.getContext(args.subcontext)) {
                        context = self.getContext(args.subcontext);
                    } else {
                        context = self.getContext(args.context);
                        doCreateContext = args.subcontext;
                    }
                } else {
                    // get or create new context
                    if (self.getContext(args.context)) {
                        context = self.getContext(args.context);
                    } else {
                        // write log then create context with its node
                        doCreateContext = args.context;
                    }
                }
            }

            // write message to log node
            log.addChild(txt);
            
            // write object to log node
            if (args.obj) {
                objtxt = document.createTextNode(args.obj);
                
                // object node expansion
                objexp.element.onclick = function (event) {
                    // elements
                    var btn = event.target,
                        parent = btn.parentNode;
                    
                    // check state
                    if (util.contains(
                            parent.className,
                            "kbs-expand"
                        )) {
                        // shrink
                        parent.className =
                            parent.className.replace(" kbs-expand", "");
                        
                        btn.className =
                            btn.className.replace(" kbs-rotate", "");
                    } else {
                        // expand
                        parent.className += " kbs-expand";
                        btn.className += " kbs-rotate";
                    }
                };
                
                objwrap.addChild(objexp.element);
                objwrap.addChild(objtxt);
                log.addChild(objwrap.element);
            }
            
            // check if test node within exec node
            contextParent = context.parentNode.className;
            if (args.type === "test" &&
                    util.contains(contextParent, "kbs-exec")) {
                log.addClass("kbs-log-close");
            }

            // write to context
            context.appendChild(log.element);
            
            // create context with new log node
            // if set to create
            if (doCreateContext) {
                self.createContext(doCreateContext, log.element);
            }

            // refresh
            self.refresh();
        };
        
        // create toolbar widget
        Console.prototype.createTool = function (tool) {
            var toolbar = this.wrapper.constools,
                icon;
            
            if (typeof toolbar === "undefined") {
                throw new Error("Could not create new tool, no toolbar!");
            }

            icon = this.getIcon(tool);
            toolbar[tool] = toolbar.createChild(
                "i",
                "fa fa-" + icon + " kbs-tool kbs-" + tool
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
            this.wrapper.removeClass("kbs-close");
            this.wrapper.addClass("kbs-open");
        };
        
        // close console
        Console.prototype.close = function () {
            this.wrapper.removeClass("kbs-open");
            this.wrapper.addClass("kbs-close");
        };
        
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
            
            // clear buffer
            cache.console.clearBuffer();

            // bench
            end = new Date().getTime() - start;
            util.log("okay", "cleared all logs in " + end + " ms");
        };
        
        // save the output buffer to a text file on the local system
        Console.prototype.save = function (filename) {
            // declarations
            var time = util.ftime(),
                date = util.fdate(),
                buffer = cache.console.getBuffer(),
                
                // setup request
                req = new Http({
                    url: router.getRoute("console", "save"),
                    method: "POST",
                    send: true,
                    data: {
                        type: "log",
                        date: date,
                        buffer: buffer
                    },
                    success: function (response) {
                        util.log("okay", response);
                    }
                });
        };
        
        // destroy console instance (irreversible)
        Console.prototype.destroy = function () {
            var
                modalTitle = "Destroy the Console instance?",
                
                modalMsg = "Confirm destruction of the GUI Console? " +
                "(irreversible until refresh).",
                
                modal = new Modal("prompt", gui, {
                    init: true,
                    title: modalTitle,
                    message: modalMsg,
                    confirm: function () {
                        var parent = self.wrapper.parent(),
                            child = self.wrapper.element;
                        
                        // destroy console node
                        parent.removeChild(child);
                        
                        // set console status
                        status.console = false;
                        
                        // clear the log buffer
                        cache.console.clearBuffer();
                        
                        // destroy the modal
                        modal.destroy();
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
            constitle.addChild(titlenode);
            
            // toggle tool
            this.createTool("toggle")
                .element.onclick = function () {
                    var closed = wrapper.hasClass("kbs-close"),
                        full = wrapper.hasClass("kbs-full");

                    // if not closed and not full screen
                    if (!closed && !full) {
                        // make full screen
                        wrapper.addClass("kbs-full");
                    }

                    // if in full screen
                    if (full) {
                        // shrink
                        wrapper.removeClass("kbs-full");
                    }

                    // if closed
                    if (closed) {
                        // open
                        self.open();
                    }
                };
            
            // save tool
            this.createTool("save")
                .element.onclick = function () {
                    self.save();
                };

            // destroy tool
            this.createTool("destroy")
                .element.onclick = function () {
                    self.destroy();
                };

            // clear tool
            this.createTool("clear")
                .element.onclick = function () {
                    self.clear();
                };

            // close tool
            this.createTool("close")
                .element.onclick = function () {
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