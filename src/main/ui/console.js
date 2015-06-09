/*
*   @type javascript
*   @name console.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    [
        'config',
        'main/components/util',
        'main/components/events',
        'main/components/http',
        'main/components/status',
        'main/components/router',
        'main/components/cache',
        'main/components/configurator',
        'main/ui/node',
        'main/ui/modal'
    ],
    function (
        config,
        util,
        events,
        Http,
        status,
        router,
        cache,
        Configurator,
        Node,
        Modal
    ) {
        'use strict';
            
        // instance pointers
        var self, gui,
            configurator = new Configurator();
        
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
            
            // tool nodes
            this.tools = {};
            
            // set gui and build the tree
            gui = instance;
            this.buildNodeTree();
            
            // log contexts
            this.setContexts();
            
            // log nodes
            this.logs = [];
            
            // setup context clearance event
            events.subscribe("gui/contexts/clear", function (context) {
                self.clearContext(context);
            });
            
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
                def: self.wrapper.cons.out
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
            var contextNode;
            
            // make sure not already defined
            if (this.contexts[context]) {
                util.log("error", "Log context: '" + context +
                         "' is already defined");
            }
            
            if (util.isNode(element)) {
                contextNode = element.createChild("div", "kbs-log-context", context);
            } else {
                // manually append new Node
                contextNode = new Node("div", "kbs-log-context", "kbs-ctx-" + context);
                element.appendChild(contextNode.element);
            }
            
            // apply to global contexts
            this.contexts[context] = contextNode;
            
            return contextNode;
        };
            
        // clear/remove a logging context
        Console.prototype.clearContext = function (context) {
            var index;
            
            // don't allow clearing of def context
            if (context === "def") {
                return;
            }
            
            self.contexts[context] = null;
            delete self.contexts[context];
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
                
                objwrap.addChild(objexp);
                objwrap.addChild(objtxt);
                log.addChild(objwrap);
            }
            
            // check if test node within exec node
            if (context.parentNode) {
                contextParent = context.parentNode.className;
                if ((args.type.match(/(test)|(buffer)/)) &&
                        util.contains(contextParent, "kbs-exec")) {
                    log.addClass("kbs-log-closed");
                }
            }
                
            // write to context
            context.addChild(log);
            
            // add to list of log nodes
            self.logs.push(log);
            
            // create context with new log node
            if (doCreateContext) {
                self.createContext(doCreateContext, log);
            }

            // scroll to log
            self.scrollToElement(log.element);
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

            // add to tools
            this.tools[tool] = toolbar[tool];
            
            return toolbar[tool];
        };
            
        // remove a toolbar widget
        Console.prototype.removeTool = function (tool) {
            this.tools[tool].destroy();
        };
        
        // get toolbar widget icon from config
        Console.prototype.getIcon = function (tool) {
            return config.gui.console.icons[tool] || "plus";
        };
        
        // open console
        Console.prototype.open = function () {
            self.wrapper.removeClass("kbs-closed");
            self.wrapper.addClass("kbs-open");
        };
        
        // close console
        Console.prototype.close = function () {
            self.wrapper.removeClass("kbs-open");
            self.wrapper.addClass("kbs-closed");
        };
        
        // scrolls to an element inside the console
        Console.prototype.scrollToElement = function (element) {
            // scroll to element in console
            var cons = self.wrapper.cons.element;
            cons.scrollTop = element.offsetTop;
        };
            
        // toggle object logs
        Console.prototype.toggleObjectLogs = function () {
            var objs = document.querySelectorAll(".kbs-object"),
                displayed,
                len = objs.length,
                i = 0;

            // hide the nodes
            for (i; i < len; i += 1) {
                displayed = objs[i].style.display !== "none";
                objs[i].style.display = (displayed) ? "none" : "block";
            }
        };
         
        // clear output
        Console.prototype.clear = function () {
            var cons = self.wrapper.cons.element,
                out = self.wrapper.cons.out.element,
                start = new Date().getTime(),
                logs = self.logs,
                len = logs.length,
                deltaTime,
                count = 0,
                i = 0;

            // detach
            cons.removeChild(out);

            // remove all logs
            for (i; i < len; i += 1) {
                logs[i].destroy();
                count += 1;
            }

            // reattach
            cons.appendChild(out);
            
            // bench
            deltaTime = new Date().getTime() - start;
            util.log("okay", "cleared " + count + " logs in " + deltaTime + " ms");
            
            // clear buffer
            cache.console.clearBuffer();
            
            // reset log count
            cache.logCount = 0;
        };
        
        // save the output buffer to a text file on the local system
        Console.prototype.save = function (filename) {
            // declarations
            var time = util.ftime(),
                date = util.fdate(),
                buffer = cache.console.getBuffer(),
                req;
            
            util.log.beginContext("log/save");
            util.log("info", "saving log buffer...");
            
            // setup request
            req = new Http({
                url: router.getRoute("console/save"),
                method: "POST",
                send: true,
                data: {
                    type: "log",
                    date: date,
                    buffer: buffer
                },
                success: function (response) {
                    util.log("context:log/save", "okay", response);
                    util.log.endContext();
                    util.log.clearContext("log/save");
                }
            });
        };
        
        // destroy console instance (irreversible)
        Console.prototype.destroy = function () {
            var
                modalTitle = "Destroy the Console instance?",
                modalMsg = "Confirm destruction of the GUI Console? ",
                modal = new Modal("console-destruct", {
                    init: true,
                    confirm: function () {
                        self.commitDestroy(modal, "hard");
                    },
                    cancel: function () {
                        modal.close();
                    }
                });
        };
            
        // committed destroy
        Console.prototype.commitDestroy = function (modal, method) {
            if (method === "hard") {
                var parent = self.wrapper.cons.parent(),
                    child = self.wrapper.cons.element;

                // store in cache to allow same session
                // restoration
                cache.console.parent = parent;
                cache.console.child = child;

                // destroy console node
                parent.removeChild(child);
            }
            
            // set console status
            status.console = false;

            // clear the log buffer
            cache.console.clearBuffer();
            
            // add disabled class to cons-box
            self.wrapper.addClass("kbs-disabled");

            // remove tool
            self.removeTool("destroy");

            // close the modal
            if (modal) {
                modal.close();
            }
            
            // update configurator
            configurator.set("gui/console/destroyed", true);
        };
            
        // restore console after being destroyed
        Console.prototype.restore = function () {
            this.wrapper.removeClass("kbs-disabled");
        };
        
        // build the console
        Console.prototype.buildNodeTree = function () {
            // declarations
            var
                connection =
                (window.KBS_BASE_URL.indexOf("localhost") !== -1)
                ? "local" : "remote",
            
                // console nodes
                wrapper,
                consclass,
                constools,
                constitle,
                titlenode,
                cons,
                consout,
                consicon,
                
                cfgmodal;

            // console wrapper
            consclass = "kbs-cons-box " + config.gui.console.state;
            this.wrapper = wrapper = gui.createChild("div", consclass);
            
            if (!config.logs.enabled) {
                wrapper.addClass("kbs-disabled");
            }

            // console toolbar
            constools = wrapper.constools =
                wrapper.createChild("div", "kbs-cons-toolbar");

            // add a title to the toolbar
            constitle = constools.constitle =
                constools.createChild("div", "kbs-cons-title");

            titlenode = document.createTextNode(config.appFullname +
                    " v" + config.version + " - " + connection);
            constitle.addChild(titlenode);
            
            // tools for console
            if (config.logs.enabled) {
                // console toggle state tool
                this.createTool("menu").on(
                    "click",
                    function () {
                        var closed = wrapper.hasClass("kbs-closed"),
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
                    }
                );
                
                // console toggle tool
                this.createTool("toggle").on(
                    "click",
                    function () {
                        var displayed = configurator.get(
                            "gui/console/displayed"
                        );
                        
                        wrapper.toggleClass("kbs-disabled");
                        configurator.set(
                            "gui/console/displayed",
                            (!displayed) ? true : false
                        );
                    }
                );
                
                // save tool - only on localhost base url's
                if (window.KBS_BASE_URL.indexOf("localhost") !== -1) {
                    this.createTool("save").on(
                        "click",
                        self.save
                    );
                }
                
                // benchmark tool
                this.createTool("benchmark").on(
                    "click",
                    self.benchmark
                );
                
                // toggle object log tool
                this.createTool("toggleObjs").on(
                    "click",
                    self.toggleObjectLogs
                );
                
                // console destructor tool
                if (config.gui.console.allowDestruction) {
                    this.createTool("destroy").on(
                        "click",
                        self.destroy
                    );
                }
                
                // clear tool
                this.createTool("clear").on(
                    "click",
                    self.clear
                );
            }
            
            // configurator tool
            this.createTool("settings").on(
                "click",
                configurator.launchModal
            );
            
            // if logs enabled, add a close tool
            if (config.logs.enabled) {
                // close tool
                this.createTool("close").on(
                    "click",
                    self.close
                );
            }
                
            // console
            wrapper.cons = cons =
                wrapper.createChild("div", "kbs-cons");
            
            // check if logs are disabled
            if (!config.logs.enabled) {
                // disable console
                cons.hide();
            }

            // console output
            consout = cons.out = cons.createChild("div", "kbs-cons-out");
            
            if (config.gui.console.destroyed) {
                this.commitDestroy(false, "hard");
            }
            
            if (!config.gui.console.displayed) {
                this.wrapper.addClass("kbs-disabled");
            }
                
            // return wrapper element
            return wrapper;
        };
            
        // benchmarks the generation of log nodes
        Console.prototype.benchmark = function () {
            var cons = self.wrapper.cons.element,
                out = self.wrapper.cons.out.element,
                amount = config.gui.console.benchmark.amount,
                start = new Date().getTime(),
                deltaTime,
                deltaSpeed,
                result,
                i = 0;

            // new benchmark context
            util.log("context:benchmark", "exec", "executing benchmark...");
            util.log.beginContext("benchmark");
            
            // detach
            cons.removeChild(out);
            
            // log specified amount
            util.log("context:benchmark/output", "buffer", "benchmark output...");
            while (i < amount) {
                util.log("context:benchmark/output", "debug", "log #" + (i + 1));
                i += 1;
            }

            // reattach
            cons.appendChild(out);

            // get results
            deltaTime = new Date().getTime() - start;
            deltaSpeed = Math.floor(amount / deltaTime * 1000);
            result = "Logged " + amount + " messages in " + deltaTime + "ms";
            
            // log delta time
            util.log(
                "context:benchmark",
                "okay",
                result
            );
            
            // log delta speed
            util.log(
                "okay",
                deltaSpeed + " logs per second."
            );
            
            // clear the benchmark context
            util.log.endContext();
            self.clearContext("benchmark");
            self.clearContext("benchmark/output");
        };
        
        return Console;
    }
);