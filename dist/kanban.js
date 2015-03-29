/*
*   @type javascript
*   @name config.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define('config',{
    appName: "kbs",
    version: 0.9,
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
            state: "kbs-open",
            autoscroll: true,
            icons: {
                save: "file-text",
                clear: "trash",
                toggle: "terminal",
                close: "times",
                destroy: "unlink",
                example: "plus-circle",
                expand: "caret-square-o-right"
            }
        }
    },
    events: {
        silent: false
    },
    routes: {
        console: {
            save: "kanban/endpoint/console/save.php"
        }
    },
    tooltips: {
        save: "Save the output buffer to text file",
        clear: "Clear all logs",
        toggle: "GUI Console State",
        close: "Close the console",
        destroy: "Destroy this console instance"
    }
});

/*
*   @type javascript
*   @name events.js
*   @copy Copyright 2015 Harry Phillips
*/

/*jslint devel: true */

/*global define: true */

define('src/components/events',['config'], function (config) {
    
    
    function Events() {
        this.topics = {};
    }
    
    // subscribe/create event topic
    Events.prototype.subscribe = function (event, handler) {
        if (!this.topics[event]) {
            // create a event topic
            this.topics[event] = [];
        }
        
        // apply handler to event
        this.topics[event].push(handler);
    };
    
    // publish event with data
    Events.prototype.publish = function (event, data) {
        if (!this.topics[event]) {
            if (!config.events.silent) {
                throw new Error("Event '" + event + "' does not exist!");
            }
            return;
        }
        
        // publish data to all event handlers
        var i;
        for (i = 0; i < this.topics[event].length; i += 1) {
            this.topics[event][i](data);
        }
        
        // make data an object if it isn't already so
        // so we can log it nicely
        if (typeof data !== "object") {
            data = {
                "data": data
            };
        }
    };
    
    return new Events();
});
/*
*   @type javascript
*   @name states.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define('src/components/status',{
    app: false,
    gui: false,
    console: false
});
/*
*   @type javascript
*   @name buffer.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define('src/components/buffer',[],function () {
    
    
    var outs = [];
    
    // buffer constructor
    function Buffer(predef) {
        // push to Buffer global 'outs'
        outs.push(predef || "");
        
        // set the index of our buffer
        this.index = outs.length - 1;
    }
    
    // write a value to buffer
    Buffer.prototype.writeToBuffer = function (value) {
        // get index
        var i = this.index;
        
        // add to string buffer
        if (typeof outs[i] === "string") {
            outs[i] += value;
            return;
        }
        
        // add to array buffer
        if (outs[i] instanceof Array) {
            outs[i].push(value);
            return;
        }
    };
    
    // remove a value from buffer
    Buffer.prototype.removeFromBuffer = function (value) {
        var i = this.index;
        
        // string buffer
        if (typeof outs[i] === "string") {
            outs[i] = outs[i].replace(value, "");
            return;
        }
        
        // array buffer
        if (outs[i] instanceof Array) {
            outs[i].splice(outs[i].indexOf(value), 1);
            return;
        }
    };
    
    // return the buffer
    Buffer.prototype.getBuffer = function () {
        return outs[this.index];
    };
    
    // return the global buffer
    Buffer.prototype.getGlobalBuffer = function () {
        return outs;
    };
    
    // clear the buffer
    Buffer.prototype.clearBuffer = function () {
        var i = this.index;
        
        // splice our buffer index from global buffer
        outs.splice(i, 1);
    };
    
    return Buffer;
});
/*
*   @type javascript
*   @name cache.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define('src/components/cache',['./buffer'], function (Buffer) {
    
    
    // cache object
    var cache = {
        kbs: new Buffer(),
        console: new Buffer()
    };
    
    return cache;
});
/*
*   @type javascript
*   @name util.js
*   @copy Copyright 2015 Harry Phillips
*/

/*
*    TODO:
*    + add the ability for sub logs (possibly gui console only)
*      to allow log nodes inside of other log nodes.
*
*    + possibly think about adding 'log contexts' to support the
      above by allowing logs to be written inside a new context,
      other than the console out element.
*/

/*global define: true */

define(
    'src/util',[
        'config',
        './components/events',
        './components/status',
        './components/cache'
    ],
    function (config, events, status, cache) {
        

        var util = {};

        // amend zeros to a number until a length is met
        util.zerofy = function (num, len) {
            while (num.toString().length < (len || 2)) {
                num = '0' + num;
            }

            return num;
        };

        // amend spaces to a string/number until a length is met
        util.spacify = function (str, len) {
            if (typeof str !== "string") {
                str = str.toString();
            }

            while (str.length < len) {
                str = " " + str;
            }

            return str;
        };

        // returns current time as formatted string
        util.ftime = function () {
            var time = new Date(),

                hours = util.zerofy(time.getHours()),
                minutes = util.zerofy(time.getMinutes()),
                seconds = util.zerofy(time.getSeconds()),
                millis = util.zerofy(time.getMilliseconds(), 3);

            return hours + ":" + minutes + ":" + seconds + "." + millis;
        };

        // returns current date as formatted string
        util.fdate = function () {
            var time = new Date(),

                year = util.zerofy(time.getFullYear(), 4),
                month = util.zerofy(time.getMonth(), 2),
                date = util.zerofy(time.getDate(), 2);

            return year + "-" + month + "-" + date;
        };

        // escapes regex meta characters from a string
        util.escapeRegEx = function (str) {
            var result;

            result =
                String(str).replace(/([\-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1');

            result = result.replace(/\x08/g, '\\x08');

            return result;
        };

        // checks if input is an array
        util.isArray = function () {};

        // returns true or the index
        util.contains = function (host, target, strict) {
            var i = 0,
                occs = [],
                regex;

            // default strict to false
            strict = strict || false;

            // if not strict - use indexOf to find substring
            if (!strict) {
                return host.indexOf(target) !== -1;
            }

            // escape regex meta chars from target before generating a new RegEx
            target = util.escapeRegEx(target);

            // regex will match whole word of target only
            regex = new RegExp("(\\W|^)" + target + "(\\W|$)");

            // is host an array?
            if (util.isArray(host)) {
               // add to occurences array
                while (i < host.length) {
                    if (regex.test(host[i])) {
                        occs.push(i);
                    }
                    i += 1;
                }

                // return index(es)
                return (occs.length === 0) ? false :
                        (occs.length > 1) ? occs : occs[0];
            } else if (regex.test(host)) {
                return true;
            }

            return false;
        };

        // log wrapper
        util.log = function (type, msg, opt) {
            // check if logs are enabled
            if (!config.logs.enabled) {
                return;
            }

            // declarations
            var i = 0, param, args = [],
                filter = config.logs.filter,
                output = [],
                str = "",
                object = false,
                guistr = "",
                objstr = "",
                bffstr = "";

            // process arguments into an actual array
            for (param in arguments) {
                if (arguments.hasOwnProperty(param)) {
                    args.push(arguments[param]);
                }
            }

            // check and process args
            if (args.length > 2) {
                // given all params
                if (typeof msg === 'object') {
                    object = msg;
                    msg = opt;
                }
            } else if (args.length > 1) {
                // given 2 params
                if (typeof type === 'object') {
                    // not passed a type
                    // passed an object and a msg
                    // adjust params appropriately
                    object = type;
                    type = "log";
                } else if (typeof msg === 'object') {
                    // passed a typed object log
                    object = msg;
                    msg = "";
                }
            } else {
                // given 1 param
                // adjust params
                msg = type;
                type = 'log';

                // check if msg is object
                if (typeof msg === 'object') {
                    // passed a typed object log
                    object = msg;
                    msg = "";
                }
            }

            // check if we need to filter the type
            if (filter) {
                // apply filter
                if (util.contains(filter, type, true)) {
                    return;
                }
            }

            // format and push output
            str += "[" + config.appName + "] ";
            str += util.ftime();
            str += util.spacify("[" + type + "]", 8) + ":> ";
            str += msg;
            output.push(str);

            // create stringified object
            if (object) {
                objstr = "Object " + JSON.stringify(object, null, 4);   
            }
            
            // write to buffer
            bffstr = str.replace(/\s/g, " ");
            bffstr = encodeURIComponent(bffstr);
            bffstr += (objstr !== "") ? "\n" + objstr : "";
            bffstr += "\n";
            cache.console.writeToBuffer(bffstr);
            
            // log to gui if enabled
            if (config.logs.gui && status.console) {
                guistr = str.replace(/\s/g, " ");
                
                // publish the log event with str data
                events.publish("gui/log", {
                    msg: guistr,
                    type: type,
                    obj: objstr
                });
            }

            // validate the type only after filter application
            // and str build to allow filtering of
            // non-standard types
            if (!window.console[type]) {
                type = "log";
            }

            // push object to output if exists
            if (object) {
                output.push(object);
            }

            // write outputs to console
            while (i < output.length) {
                window.console[type](output[i]);
                i += 1;
            }
        };

        util.log("+ util.js loaded");

        return util;
    }
);

/*
*   @type javascript
*   @name coutner.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define('src/components/counter',[],function () {
    
    
    function Counter(target, callback) {
        var value = 0;
        
        this.target = target;
        this.exec = callback;
        
        Object.defineProperty(this, "count", {
            get: function () {
                return value;
            },
            set: function (newvalue) {
                value = newvalue;
                
                if (value >= target) {
                    this.exec();
                }
            }
        });
    }
    
    return Counter;
});
/*
*   @type javascript
*   @name http.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define('src/components/http',['src/util', './counter'], function (util, Counter) {
    
    
    // instance pointer
    var self;
    
    // construct a http request
    function Http(params) {
        // props
        this.url = params.url;
        this.method = params.method || "GET";
        this.async = params.async || true;
        this.data = params.data;
        
        // handlers
        this.callbacks = {};
        this.callbacks.success = params.success || function () {};
        this.callbacks.fail = params.fail || function () {};
        
        // set pointer
        self = this;
        
        // auto send
        if (params.send) {
            this.send(this.data);
        }
    }
    
    // build encoded data string
    Http.prototype.encodeData = function (data) {
        var encodedString = "",
            i;
            
        for (i in data) {
            if (data.hasOwnProperty(i)) {
                encodedString += i + "=" + data[i] + "& ";
            }
        }
        
        return encodedString;
    };
    
    // send request
    Http.prototype.send = function () {
        // new request
        var xml = new XMLHttpRequest();
        
        // open
        xml.open(this.method, this.url, this.async);
        
        // set content type
        xml.setRequestHeader("Content-Type",
                             "application/x-www-form-urlencoded");
        
        xml.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200 && this.status < 400) {
                    // success
                    util.log("debug", "HTTP 200: " + self.url);
                    self.callbacks.success(this.responseText);
                } else {
                    // failure
                    util.log("debug", "HTTP " + this.status + ": " + self.url);
                    self.callbacks.fail(this.responseText);
                }
            }
        };
        
        // send
        xml.send(self.encodeData(self.data));
        
        // nullify
        xml = null;
    };
    
    return Http;
});
/*
*   @type javascript
*   @name node.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    'src/ui/node',['config'],
    function () {
        
        
        // node constructor
        function Node(type, classes, id) {
            // set props
            this.type = type;
            this.classes = classes;
            this.selector = id;
            
            // create element
            this.element = document.createElement(type);
            this.element.className = classes || "";
            
            if (id) {
                this.element.id = id;
            }
        }

        // add a child to node
        Node.prototype.addChild = function (node) {
            // check if node is an instance of class Node
            if (node.constructor === Node || node instanceof Node) {
                this.element.appendChild(node.element);
                return;
            }
            
            // just a HTML node, append
            this.element.appendChild(node);
        };

        // create and add child to node
        Node.prototype.createChild = function (type, classes, id) {
            var node = new Node(type, classes, id);
            this.addChild(node.element);
            return node;
        };
        
        // delete node and it's children
        Node.prototype.destroy = function () {
            this.element.parentNode.removeChild(this.element);
        };
        
        // clone node instance and return
        Node.prototype.clone = function () {
            var clone = new Node(
                this.type,
                this.classes,
                this.selector
            );
            
            // nullify the new node element and clone this
            clone.element = null;
            clone.element = this.element.cloneNode();
            
            return clone;
        };
        
        return Node;
    }
);
/*
*   @type javascript
*   @name router.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define('src/components/router',['config'], function (config) {
    
    
    return {
        // return a route to a component controller
        getRoute: function (component, fn) {
            return window.KBS_BASE_URL + config.routes[component][fn];
        }
    };
});
/*
*   @type javascript
*   @name modal.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    'src/ui/modal',[
        'config',
        'src/util',
        'src/components/events',
        'src/components/http',
        'src/components/status',
        './node'
    ],
    function (config, util, events, Http, status, Node) {
        

        // instance pointer
        var self, gui;
        
        function Modal(type, instance, params) {
            // set pointer
            self = this;
            
            // check if a type has been passed
            if (typeof type !== "string") {
                // adjust arguments
                params = instance;
                instance = type;
                type = null;
            }
            
            // set props
            gui = instance;
            this.type = type;
            this.node = new Node("div", "kbs-modal");
            this.node.element.style.display = "none";
            
            if (type) {
                this.node.element.className += " kbs-" + type;
            }
            
            this.onConfirm = params.confirm || function () {};
            this.onCancel = params.cancel || function () {};
            
            // text content
            this.title = params.title;
            this.message = params.message;
            
            // initialise
            if (params.init) {
                this.init();
            }
        }
        
        // init and open modal
        Modal.prototype.init = function () {
            // declarations
            var title = this.node.createChild("h2", "kbs-modal-title"),
                message = this.node.createChild("p", "kbs-modal-msg"),
                close = this.node.createChild("i", "fa fa-times kbs-modal-close"),
                confirm,
                cancel;
            
            title.element.textContent = this.title;
            message.element.textContent = this.message;
            
            close.element.onclick = function () {
                self.close();
            };
            
            // append components
            this.node.addChild(title);
            this.node.addChild(close);
            this.node.addChild(message);
            
            // add confirm/cancel buttons for prompt modals
            if (this.type === "prompt") {
                // confirm
                confirm = this.node.createChild("span", "kbs-confirm");
                confirm.element.textContent = "confirm";
                confirm.element.onclick = this.onConfirm;
                
                // cancel
                cancel = this.node.createChild("span", "kbs-cancel");
                cancel.element.textContent = "cancel";
                cancel.element.onclick = this.onCancel;
                
                // click event handlers
                
                this.node.addChild(confirm);
                this.node.addChild(cancel);
            }
            
            // add our node to gui
            gui.addChild(this.node.element);
            
            // open the modal
            this.open();
        };
        
        // reveal modal and overlay
        Modal.prototype.open = function () {
            gui.tree.main.overlay.element.style.display = "block";
            this.node.element.style.display = "block";
        };
        
        // close modal and overlay
        Modal.prototype.close = function () {
            gui.tree.main.overlay.element.style.display = "none";
            this.node.element.style.display = "none";
        };

        return Modal;
    }
);
/*
*   @type javascript
*   @name console.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    'src/ui/console',[
        'config',
        'src/util',
        'src/components/events',
        'src/components/http',
        'src/components/status',
        'src/components/router',
        'src/components/cache',
        'src/ui/node',
        'src/ui/modal'
    ],
    function (config, util, events, Http, status, router, cache, Node, Modal) {
        
        
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
                buffer = cache.console.getBuffer(),
                
                // setup request
                req = new Http({
                    url: router.getRoute("console", "save"),
                    method: "POST",
                    send: true,
                    data: {
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
/*
*   @type javascript
*   @name gui.js
*   @copy Copyright 2015 Harry Phillips
*/

/*jslint devel: true */

/*global define: true */

/*
    TODO:
    
    - Add an array to Node class to store child nodes
    - Add ability to remove child nodes
    - Re-write to support the new node tree structure
*/

define('src/ui/gui',['require','config','src/util','src/components/events','./node','src/components/counter','./console','./modal'],function (require) {
    

    // dependencies
    var
        config = require('config'),
        util = require('src/util'),
        events = require('src/components/events'),
        Node = require('./node'),
        Counter = require('src/components/counter'),
        Console = require('./console'),
        Modal = require('./modal'),
        
        // instance pointer
        self;
    
    util.log("+ gui.js loaded");

    // gui constructor
    function GUI() {
        // set pointer
        self = this;

        this.tree = this.buildNodeTree();
        this.console = new Console(this);
        this.modal = new Modal(this, {
            init: false,
            title: "Test Modal - Title",
            message: "Test paragraph / modal content."
        });

        // update gui status
        events.publish("kbs/status", {
            component: "gui",
            status: true
        });
    }

    // initialise gui
    GUI.prototype.init = function () {
        var
            // loader
            loader = new Counter(3, function () {
                events.publish("kbs/gui/loaded");
            }),

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

                // gui is always last to load - publish loaded event
                util.log("debug", "+ publishing 'kbs/loaded'");
                events.publish("kbs/loaded");
            };

        // gui load event listener
        events.subscribe("kbs/gui/loaded", publish);

        // props
        mainlink.rel = "stylesheet";
        themelink.rel = "stylesheet";
        falink.rel = "stylesheet";

        mainlink.href = mainurl;
        themelink.href = themeurl;
        falink.href = faurl;

        mainlink.onload = function () {
            util.log("debug", "+ main.css loaded");
            loader.count += 1;
        };
        
        mainlink.onerror = function () {
            loader.count += 1;
            throw new Error("main.css failed to load!");
        };

        themelink.onload = function () {
            util.log("debug", "+ theme.css loaded");
            loader.count += 1;
        };
        
        themelink.onerror = function () {
            loader.count += 1;
            throw new Error("theme.css failed to load!");
        };

        falink.onload = function () {
            util.log("debug", "+ font-awesome.css loaded");
            loader.count += 1;
        };
        
        falink.onerror = function () {
            loader.count += 1;
            throw new Error("font-awesome.css failed to load!");
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

    // build gui node tree
    GUI.prototype.buildNodeTree = function () {
        // create tree and nodes
        var tree = {}, main;

        // create nodes
        tree.main = main = new Node("div", "kbs-gui");
        main.overlay = tree.main.createChild("div", "kbs-overlay");

        return tree;
    };

    // refresh the gui and its child nodes
    GUI.prototype.refresh = function () {
        this.console.refresh();
    };


    // add a child node to the gui
    GUI.prototype.addChild = function (node) {
        this.tree.main.element.appendChild(node);
    };

    // create a child and add to the gui
    GUI.prototype.createChild = function (type, classes, id) {
        var node = new Node(type, classes, id);
        this.tree.main.element.appendChild(node.element);
        return node;
    };
    // benchmarks the generation of 10000 log nodes
    GUI.prototype.benchmark = function () {
        var cons = self.console.wrapper.cons.element,
            out = self.console.wrapper.cons.out.element,
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
    
    // return the current gui instance
    GUI.prototype.getCurrentInstance = function () {
        return self;
    };

    // return gui
    return GUI;
});
    

/*
*    @type javascript test
*    @name main.test.js
*    @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define('test/main.test',['require', 'src/util'], function (require, util) {
    
    
    return {
        exec: function (test) {
            util.log('test', 'executing test: "' + test + '"');
            require(['./' + test + '.test']);
        }
    };
});
/*
*   @type javascript
*   @name main.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    'src/main',[
        'config',
        './components/events',
        './util',
        './components/status',
        './components/http',
        './components/cache',
        './ui/gui',
        'test/main.test'
    ],
    function (config, events, util, status, http, cache, GUI, tests) {
        
        
        // declarations
        var kanban, exec, gui;

        // return if kanban is disabled
        if (!config.enabled) {
            return;
        }

        // subscribe to status updates
        events.subscribe("kbs/status", function (data) {
            status[data.component] = data.status;
        });

        // initialise gui
        if (config.gui.enabled) {
            gui = new GUI();
            gui.init();
        }

        // execute kanban
        exec = function () {
            // get performance delta
            window.KBS_END_TIME =
                (new Date().getTime() - window.KBS_START_TIME) + "ms";

            // log
            util.log("okay", kanban, "Kanban initialised in " +
                window.KBS_END_TIME);

            // expose the api if in dev mode
            if (config.mode === "dev") {
                window[config.appName] = kanban;
            }

            // update app status
            events.publish("kbs/status", {
                component: "app",
                status: true
            });

            // tests
            if (config.test) {
                tests.exec(['util']);
            }
        };

        // kbs data object
        kanban = {
            version: config.version,
            status: status,
            cache: cache,
            config: config,
            events: events,
            http: http,
            util: util,
            gui: gui
        };

        // wait for kbs loaded event
        events.subscribe("kbs/loaded", exec);
    }
);

/*
*   @type javascript
*   @name kanban.js
*   @copy Copyright 2015 Harry Phillips
*/

// check if globals are set
if (!window.KBS_GLOBAL_SET) {
    var KBS_GLOBAL_SET = true,
        
        KBS_START_TIME = new Date().getTime(),
        KBS_END_TIME,

        KBS_BASE_URL = "http://localhost/proj/",
        KBS_SRC_DIR = "kanban/";
}

(function (window) {
    
    
    var require = window.require;
    
    require.config({
        paths: {
            src: "src",
            test: "test"
        }
    });
    
    require(['src/main']);
}(window));

// globally exposed functions
function kbsExpandObjectNode(element) {
    
    
    if (element.parentNode.style.height !== "450px") {
        element.parentNode.style.height = "450px";
        element.className += " kbs-rotate";
    } else {
        element.parentNode.style.height = "150px";
        element.className = element.className.replace("kbs-rotate", "");
    }
};
define("kanban", function(){});

