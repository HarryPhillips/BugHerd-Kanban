(function () {/*
*   @type javascript
*   @name config.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true, clone: true */

define('config',[],function () {
    
    
    // self references the instantiated config class
    // pointer references the config object
    var self, pointer;
    
    // config class
    function Config(obj) {
        // set reference to this instance
        self = this;
        
        this.defaultObj = clone(obj);
        this.defaultObj.reset = this.reset;
        obj.reset = this.reset;
        
        this.obj = obj;
        pointer = this.obj;
    }
    
    // set config to default values
    Config.prototype.reset = function () {
        // iterate and check each property
        var i;
        for (i in self.obj) {
            if (self.obj.hasOwnProperty(i)) {
                // is a default prop?
                if (!self.defaultObj[i]) {
                    // this is a new prop - unset it
                    delete self.obj[i];
                }
                
                // set to default
                self.obj[i] = self.defaultObj[i];
            }
        }
    };
    
    // internal cloning function
    function clone(obj) {
        var copy,
            attr,
            len,
            i;

        // handle dates
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // handle arrays
        if (obj instanceof Array) {
            copy = [];
            len = obj.length;
            i = 0;

            // recursive copy
            for (i; i < len; i += 1) {
                copy[i] = clone(obj[i]);
            }

            return copy;
        }

        // handle objects
        if (obj instanceof Object) {
            copy = {};

            // recursive copy
            for (attr in obj) {
                if (obj.hasOwnProperty(attr)) {
                    copy[attr] = clone(obj[attr]);
                }
            }

            return copy;
        }

        // handle simple types
        if (typeof obj === "string"
                || typeof obj === "number"
                || typeof obj === "boolean") {
            copy = obj;
            return copy;
        }
    }
    
    // construct the config instance once only
    pointer = pointer || new Config({
        appName: "kbs",
        appFullname: "Kanban",
        version: "1.3.0-pre",
        enabled: true,
        mode: "dev",
//        offline: true,
        httpToken: "Fw43Iueh87aw7",
//        theme: "black",
//        test: true,
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
            console: {
                state: "kbs-close",
                autoscroll: true,
                icons: {
                    save: "file-text",
                    clear: "trash",
                    toggle: "terminal",
                    close: "times",
                    destroy: "unlink",
                    example: "plus-circle",
                    benchmark: "tachometer",
                    settings: "cogs",
                    expand: "caret-square-o-right"
                }
            }
        },
        interactor: {
            enabled: true
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
            save: "Save the output buffer to text file",
            clear: "Clear all logs",
            toggle: "GUI Console State",
            close: "Close the console",
            destroy: "Destroy this console instance",
            benchmark: "Run the benchmark",
            settings: "Edit Kanban settings"
        }
    }).obj;
    
    // return the instance
    return pointer;
});

/*
*   @type javascript
*   @name events.js
*   @copy Copyright 2015 Harry Phillips
*/

/*jslint devel: true */

/*global define: true */

define('main/components/events',['config'], function (config) {
    
    
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
*   @name status.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define('main/components/status',{
    app: false,
    interactor: {
        taskDetailsExpanded: false
    },
    gui: false,
    console: false,
    modal: false
});
/*
*   @type javascript
*   @name buffer.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define('main/components/buffer',[],function () {
    
    
    var global = [];
    
    // buffer constructor
    function Buffer(predef) {
        // push to Buffer global 'global'
        global.push(predef || "");
        
        // set the index of our buffer
        this.index = global.length - 1;
    }
    
    // write a value to buffer
    Buffer.prototype.writeToBuffer = function (value) {
        // get index
        var buffer = this.index;
        
        // add to string buffer
        if (typeof global[buffer] === "string") {
            global[buffer] += value;
            return;
        }
        
        // add to array buffer
        if (global[buffer] instanceof Array) {
            global[buffer].push(value);
            return;
        }
    };
    
    // remove a value from buffer
    Buffer.prototype.removeFromBuffer = function (value) {
        var buffer = this.index,
            position;
        
        // string buffer
        if (typeof global[buffer] === "string") {
            global[buffer] = global[buffer].replace(value, "");
            return;
        }
        
        // array buffer
        if (global[buffer] instanceof Array) {
            position = global[buffer].indexOf(value);
            global[buffer].splice(position, 1);
            return;
        }
    };
    
    // return the buffer
    Buffer.prototype.getBuffer = function () {
        return global[this.index];
    };
    
    // return the global buffer
    Buffer.prototype.getGlobalBuffer = function () {
        return global;
    };
    
    // clear the buffer
    Buffer.prototype.clearBuffer = function () {
        var buffer = this.index;
        
        // nullify buffer
        global[buffer] = null;
        
        // generate new buffer
        global[buffer] = "";
    };
    
    return Buffer;
});
/*
*   @type javascript
*   @name cache.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define('main/components/cache',['main/components/buffer'], function (Buffer) {
    
    
    // cache object
    var cache = {
        app: new Buffer(),
        console: new Buffer()
    };
    
    return cache;
});
/*
*   @type javascript
*   @name util.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    'main/components/util',[
        'config',
        'main/components/events',
        'main/components/status',
        'main/components/cache'
    ],
    function (config, events, status, cache) {
        

        // util class
        function Util() {}
        
        // set instance for internal references
        var instance = new Util();
        
        // amend zeros to a number until a length is met
        Util.prototype.zerofy = function (num, len) {
            while (num.toString().length < (len || 2)) {
                num = '0' + num;
            }

            return num;
        };

        // amend spaces to a string/number until a length is met
        Util.prototype.spacify = function (str, len) {
            if (typeof str !== "string") {
                str = str.toString();
            }

            while (str.length < len) {
                str = " " + str;
            }

            return str;
        };

        // returns current time as formatted string
        Util.prototype.ftime = function () {
            var time = new Date(),

                hours = instance.zerofy(time.getHours()),
                minutes = instance.zerofy(time.getMinutes()),
                seconds = instance.zerofy(time.getSeconds()),
                millis = instance.zerofy(time.getMilliseconds(), 3);

            return hours + ":" + minutes + ":" + seconds + "." + millis;
        };

        // returns current date as formatted string
        Util.prototype.fdate = function () {
            var time = new Date(),

                year = instance.zerofy(time.getFullYear(), 4),
                month = instance.zerofy(time.getMonth(), 2),
                date = instance.zerofy(time.getDate(), 2);

            return year + "-" + month + "-" + date;
        };

        // escapes regex meta characters from a string
        Util.prototype.escapeRegEx = function (str) {
            var result;
            
            // escape
            result = String(str)
                .replace(/([\-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1')
                .replace(/\x08/g, '\\x08');

            return result;
        };
        
        // cookie lib
        Util.prototype.cookie = {
            // gets a cookie with name
            get: function (name) {
                var cname = config.cookies.prefix + name + "=",
                    ca = document.cookie.split(';'),
                    i,
                    c;

                for (i = 0; i < ca.length; i += 1) {
                    c = ca[i];

                    while (c.charAt(0) === ' ') {
                        c = c.substring(1);
                    }

                    if (c.indexOf(cname) === 0) {
                        return c.substring(cname.length, c.length);
                    }
                }
            
                return "";
            },
            // sets a cookie with name, value and options expiry days
            set: function (name, value, days) {
                var expires, date;
            
                if (days) {
                    date = new Date();
                    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                    expires = "; expires=" + date.toGMTString();
                } else {
                    expires = "";
                }

                // write cookie
                document.cookie =
                    config.cookies.prefix + name +
                    "=" + value + expires + "; path=/";
            },
            // deletes a cookie by name
            del: function (name) {
                instance.cookie.set(name, "", -1);
            },
            // returns true if cookie exists
            exists: function (name) {
                var cookie = instance.cookie.get(name);
                return cookie !== "" && cookie !== null && cookie !== undefined;
            }
        };
        
        // checks if obj is a Node
        Util.prototype.isNode = function (obj) {
            return obj.constructor.name === "Node";
        };
        
        // checks if input is a dom element
        Util.prototype.isDomElement = function (obj) {
            return (
                (typeof window.HTMLElement === "object") ?
                        obj instanceof window.HTMLElement :
                        obj &&
                            typeof obj === "object" &&
                            obj !== null &&
                            obj.nodeType === 1 &&
                            typeof obj.nodeName === "string"
            );
        };
        
        // parse a html string into DOM element
        Util.prototype.parseHTML = function (html) {
            var element = document.createElement("div");
            element.innerHTML = html;
            return element;
        };
        
        // checks if input is a date object
        Util.prototype.isDate = function (obj) {
            if (typeof obj === "undefined") {
                return false;
            }
            return obj instanceof Date;
        };
        
        // checks if input is an array
        Util.prototype.isArray = function (obj) {
            if (typeof obj === "undefined") {
                return false;
            }
            return obj instanceof Array || obj.constructor.name === "Array";
        };
        
        // checks if input is an object
        Util.prototype.isObject = function (obj) {
            if (typeof obj === "undefined") {
                return false;
            }
            return obj instanceof Object;
        };
        
        // checks if input is a string
        Util.prototype.isString = function (obj) {
            if (typeof obj === "undefined") {
                return false;
            }
            return typeof obj === "string";
        };
        
        // checks if input is a number
        Util.prototype.isNumber = function (obj) {
            if (typeof obj === "undefined") {
                return false;
            }
            return typeof obj === "number";
        };
        
        // checks if input is a boolean (strictly of boolean type)
        Util.prototype.isBoolean = function (obj) {
            if (typeof obj === "undefined") {
                return false;
            }
            return typeof obj === "boolean";
        };

        // returns true or the index
        Util.prototype.contains = function (host, target, strict) {
            var i = 0,
                occs = [],
                regex,
                chk,
                temp;
            
            // make sure target and host are defined
            if (typeof host === "undefined" || host === "") {
                // throw an error if host is undefined
                throw new Error("Could not determine a contained value, " +
                               "haystack object is undefined!");
            }
            
            if (typeof target === "undefined" || target === "") {
                return false;
            }
            
            // checker function
            chk = function (host, target) {
                // if not strict - use indexOf to find substring
                if (!strict) {
                    return host.indexOf(target) !== -1;
                }

                // escape regex meta chars from target
                // before generating a new RegEx
                target = instance.escapeRegEx(target);

                // regex will match whole word of target only
                regex = new RegExp("(\\W|^)" + target + "(\\W|$)");

                // is host an array?
                if (instance.isArray(host)) {
                   // add to occurences array
                    while (i < host.length) {
                        if (regex.test(host[i])) {
                            occs.push(i);
                        }
                        i += 1;
                    }

                    if (!strict) {
                        return true;
                    } else {
                        // return the index(es)
                        return (occs.length === 0) ? false :
                                (occs.length > 1) ? occs : occs[0];
                    }
                } else if (regex.test(host)) {
                    return true;
                }

                return false;
            };

            // default strict to false
            strict = strict || false;

            // is target an array of targets?
            if (instance.isArray(target)) {
                for (i = 0; i < target.length; i += 1) {
                    temp = chk(host, target[i]);
                    if (temp !== false) {
                        return temp;
                    }
                }
            } else {
                return chk(host, target);
            }
            
            return false;
        };
        
        // swap values in array at specified indexes
        Util.prototype.swap = function (array, i, j) {
            // save array[i]
            // so we can assign to array[j]
            var tmp = array[i];
            
            // swap values
            array[i] = array[j];
            array[j] = tmp;
        };
        
        // clone an object of type Array, Object or Date
        // will also copy simple types (string, boolean etc)
        // WILL BREAK WITH CYCLIC OBJECT REFERENCES!
        Util.prototype.clone = function (obj) {
            var copy,
                attr,
                len,
                i;
            
            // handle dates
            if (instance.isDate(obj)) {
                copy = new Date();
                copy.setTime(obj.getTime());
                return copy;
            }
            
            // handle arrays
            if (instance.isArray(obj)) {
                copy = [];
                len = obj.length;
                i = 0;
                
                // recursive copy
                for (i; i < len; i += 1) {
                    copy[i] = instance.clone(obj[i]);
                }
                
                return copy;
            }
            
            // handle objects
            if (instance.isObject(obj)) {
                copy = {};
                
                // recursive copy
                for (attr in obj) {
                    if (obj.hasOwnProperty(attr)) {
                        copy[attr] = instance.clone(obj[attr]);
                    }
                }
                     
                return copy;
            }
            
            // handle simple types
            if (instance.isString(obj)
                    || instance.isNumber(obj)
                    || instance.isBoolean(obj)) {
                copy = obj;
                return copy;
            }
            
            // error if uncaught type
            instance.log(
                "error",
                "Couldn't clone object of unsupported type: " +
                    typeof obj
            );
        };

        // log wrapper
        Util.prototype.log = function (context, type, msg, opt) {
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
                subcontext = false,
                guistr = "",
                objstr = "",
                bffstr = "",
                ctxFlag = config.logs.contextFlag,
                ctxDelFlag = config.logs.contextClearFlag;

            // process arguments into an actual array
            for (param in arguments) {
                if (arguments.hasOwnProperty(param)) {
                    args.push(arguments[param]);
                }
            }
            
            // adjust args if no context
            function ctxArgsAdjust() {
                // adjust arg vars
                opt = msg;
                msg = type;
                type = context;
            }
            
            // check and process context
            if (config.logs.contexts) {
                // contexts enabled
                if (typeof context === "string") {
                    if (context.indexOf(ctxFlag) !== -1) {
                        // we have a valid context param
                        if (instance.log.currentContext !== false) {
                            // we have an active context
                            // create a subcontext
                            subcontext = context.replace(ctxFlag, "");
                            context = instance.log.currentContext;
                            args.shift();
                        } else {
                            // set new context
                            context = context.replace(ctxFlag, "");
                            args.shift();
                        }
                    } else if (context.indexOf(ctxDelFlag) !== -1) {
                        // we have a request to clear a context
                        // preserve the delete flag so console knows
                        args.shift();
                    } else {
                        ctxArgsAdjust();
                        context = instance.log.currentContext;
                    }
                } else {
                    ctxArgsAdjust();
                    context = instance.log.currentContext;
                }
            } else {
                // check if we were passed a context
                // remove it, shift and continue
                if (context.indexOf(ctxFlag) !== -1) {
                    // remove the context
                    args.shift();
                } else {
                    // adjust if no context passed
                    ctxArgsAdjust();
                }
                
                // disabled contexts
                context = false;
                subcontext = false;
            }
            
            // check and process args
            if (args.length > 2) {
                // 3 params
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
                if (instance.contains(filter, type, true) !== false) {
                    return;
                }
            }

            // format and push output
            str += instance.ftime();
            str += " [" + (subcontext || context || config.appName) + "]";
            str += " [" + type + "]" + ":> ";
            str += msg;
            output.push(str);

            // create stringified object
            if (object) {
                objstr = "Object " + JSON.stringify(object, null, 4);
            }
            
            // write to buffer
            bffstr = str.replace(/\s/g, " ");
            bffstr = encodeURIComponent(bffstr);
            
            // should write object to buffer?
            if (config.logs.obj2buffer) {
                bffstr += (objstr !== "") ? "\n" + objstr : "";
            } else {
                bffstr += (objstr !== "") ? "\n[object omitted]" : "";
            }
            
            bffstr += "\n";
            cache.console.writeToBuffer(bffstr);
            
            // log to gui if enabled
            if (config.logs.gui && status.console) {
                guistr = str.replace(/\s/g, " ");
                
                // publish the log event with str data
                events.publish("gui/log", {
                    msg: guistr,
                    type: type,
                    obj: objstr,
                    context: context,
                    subcontext: subcontext
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
        
        // current logging context - defaults to false boolean
        Util.prototype.log.currentContext = instance.log.currentContext || false;
        
        // begin a continuous logging context
        Util.prototype.log.beginContext = function (context) {
            // return if disabled
            if (!config.logs.contexts) {
                return;
            }
            
            if (context.indexOf(config.logs.contextFlag) !== -1) {
                instance.log("error", "You shouldn't pass the context flag " +
                               "when using beginContext()");
                return;
            }
            instance.log.currentContext = context;
        };
        
        // end a continuous logging context
        Util.prototype.log.endContext = function () {
            instance.log.currentContext = false;
        };
        
        // clear/remove a logging context
        Util.prototype.log.clearContext = function (context) {
            events.publish("gui/contexts/clear", context);
        };
        
        // create instance
        instance = new Util();
        instance.log("+ util.js loaded");

        return instance;
    }
);

/*
*   @type javascript
*   @name node.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    'main/components/node',['config', 'main/components/util'],
    function (config, util) {
        
        
        // node constructor
        function Node(type, classes, id) {
            // check if passed an HTML node
            if (typeof type.appendChild !== "undefined") {
                this.element = type;
            } else {
                // set props
                this.settings = {
                    type: type,
                    classes: classes,
                    id: id
                };

                // create element
                this.element = document.createElement(type);
                this.element.className = classes || "";

                if (id) {
                    this.element.id = id;
                }
            }
        }
        
        // show node
        Node.prototype.show = function () {
            this.element.style.display = "block";
        };
        
        // hide node
        Node.prototype.hide = function () {
            this.element.style.display = "none";
        };
        
        // fade in node
        Node.prototype.fadeIn = function () {
            if (typeof window.jQuery === "undefined") {
                this.show();
            }
            
            // jquery fade in
            window.jQuery(this.element).fadeIn();
        };
        
        // fade out node
        Node.prototype.fadeOut = function () {
            if (typeof window.jQuery === "undefined") {
                this.hide();
                return;
            }
            
            // jquery fade out
            window.jQuery(this.element).fadeOut();
        };
        
        // return current element id
        Node.prototype.getId = function () {
            return this.element.id;
        };
        
        // return current element classes
        Node.prototype.getClasses = function () {
            return this.element.className;
        };
        
        // return if node has a class
        Node.prototype.hasClass = function (name) {
            var i, len,
                found = false;
            
            // is there an array of names to check?
            if (util.isArray(name)) {
                len = name.length;
                for (i = 0; i < len; i += 1) {
                    if (this.element.className.indexOf(name[i]) !== -1) {
                        found = true;
                    }
                }
            } else {
                if (this.element.className.indexOf(name) !== -1) {
                    found = true;
                }
            }
            
            return found;
        };
        
        // add class(es) to node
        Node.prototype.addClass = function (classes) {
            if (this.element.className === "") {
                // no previous classes
                this.element.className = classes;
            } else {
                // add whitespace
                this.element.className += " " + classes;
            }
        };

        // remove class(es) from node
        Node.prototype.removeClass = function (classes) {
            // declarations
            var curr = this.element.className,
                newclass,
                i,
                
                remove = function (name) {
                    if (curr.indexOf(" " + name) !== -1) {
                        newclass = curr.replace(" " + name, "");
                    } else if (curr.indexOf(name + " ") !== -1) {
                        newclass = curr.replace(name + " ", "");
                    } else {
                        newclass = curr.replace(name, "");
                    }
                };
            
            // check if array or single string
            if (util.isArray(classes)) {
                // preserve current classes
                newclass = curr;
                
                // remove all classes
                for (i = 0; i < classes.length; i += 1) {
                    remove(classes[i]);
                }
            } else {
                remove(classes);
            }
            
            // set new classes
            this.element.className = newclass;
        };
        
        // set class(es) to node
        // removes all other classes
        Node.prototype.setClass = function (classes) {
            this.element.className = classes;
        };
        
        // get parent node
        Node.prototype.parent = function () {
            return this.element.parentNode;
        };
        
        // add a child to node
        Node.prototype.addChild = function (child) {
            // check if node is an instance of class Node
            if (child.constructor === Node || child instanceof Node) {
                this.element.appendChild(child.element);
                return;
            }
            
            // just a HTML node, append
            this.element.appendChild(child);
        };

        // create and add child to node
        Node.prototype.createChild = function (type, classes, id) {
            var child = new Node(type, classes, id);
            this.addChild(child.element);
            return child;
        };
        
        // detach from parent
        Node.prototype.detach = function () {
            this.element.parentNode.removeChild(this.element);
        };
        
        // (re)attach to parent
        Node.prototype.attach = function () {
            this.element.parentNode.appendChild(this.element);
        };
        
        // delete and reset node and it's children
        Node.prototype.destroy = function () {
            this.parent().removeChild(this.element);
            this.element = null;
        };
        
        // clone node instance and return
        Node.prototype.clone = function () {
            var clone = new Node(
                this.settings.type,
                this.getClasses(),
                this.getId()
            );
            
            // nullify the new node element and clone this
            clone.element = null;
            clone.element = this.element.cloneNode();
            
            return clone;
        };
        
        // focus on node
        Node.prototype.focus = function () {
            this.element.focus();
            return this;
        };
        
        // set attribute to node
        Node.prototype.attr = function (name, value) {
            this.element.setAttribute(name, value);
            return this;
        };
        
        // write or return node text
        Node.prototype.text = function (text) {
            if (typeof text === "undefined") {
                return this.element.textContent
                    || this.element.value;
            }
            
            text = document.createTextNode(text);
            this.addChild(text);
            return this;
        };
        
        // Node event listeners
        Node.prototype.on = function (event, listener) {
            this.element.addEventListener(event, listener);
            return this;
        };
        
        // write node to specified element
        // mostly used when function chaining node fn's
        Node.prototype.writeTo = function (element) {
            if (typeof element === "undefined") {
                return;
            }
            
            element.appendChild(this.element);
        };
        
        return Node;
    }
);
/*
*   @type javascript
*   @name counter.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define('main/components/counter',[],function () {
    
    
    function Counter(target, callback) {
        var value = 0,
            executed = false;
        
        this.target = target;
        this.exec = callback;
        
        Object.defineProperty(this, "count", {
            get: function () {
                return value;
            },
            set: function (newvalue) {
                value = newvalue;
                
                if (value >= target && !executed) {
                    executed = true;
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

define(
    'main/components/http',[
        'config',
        'main/components/util',
        'main/components/counter'
    ],
    function (config, util, Counter) {
        

        // instance pointer
        var self, token = config.httpToken;

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
                    encodedString += i + "=" + data[i] + "&";
                }
            }

            // append token
            if (token) {
                encodedString += "kbstoken=" + token;
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
    }
);
/*
*   @type javascript
*   @name viewloader.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define('main/ui/viewloader',['require'],function (require) {
    
    
    // view loader class
    function ViewLoader() {}
    
    // load and return a view
    ViewLoader.prototype.load = function (view, callback) {
        require(["main/views/" + view], function (mod) {
            callback(mod);
        });
    };
    
    return ViewLoader;
});
/*
*   @type javascript
*   @name modal.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

/*
*   TODO
*   + Handle element events
*/

define(
    'main/ui/modal',[
        'config',
        'main/components/util',
        'main/components/events',
        'main/components/status',
        'main/components/http',
        'main/components/node',
        'main/ui/viewloader'
    ],
    function (
        config,
        util,
        events,
        status,
        Http,
        Node,
        ViewLoader
    ) {
        
        
        // shared vars between instances
        var gui,
            self,
            vloader = new ViewLoader(),
            activeModals = [];
        
        // modal class
        function Modal(view, params) {
            self = this;
            
            // if already instantiated return
            if (util.contains(activeModals, view)) {
                return;
            }
            
            // add to the active modals array
            activeModals.push(view);
            
            // store props
            this.viewName = view;
            this.params = params;
            
            // create and hide node
            this.node = new Node("div", "kbs-modal kbs-" + view);
            this.node.hide();
            
            // view element
            this.view = null;
            
            // set modal event handlers
            this.applyHandlers(params);
            
            // load view and initialise
            this.load((params.init) ? this.init : function () {});
        }
        
        // load modal view
        Modal.prototype.load = function (onload) {
            self = this;
            
            var view;
            
            // load view from modals dir
            vloader.load(
                "modals/" + this.viewName,
                function (mod) {
                    view = mod.createView(self);
                    
                    self.view = view;
                    self.title = view.title;
                    
                    onload();
                }
            );
        };
        
        // init modal with content
        Modal.prototype.init = function () {
            // declarations
            var
                modal = self.node,
            
                title =
                modal.createChild("h2", "kbs-modal-title"),
                
                close =
                modal.createChild("i", "fa fa-times kbs-modal-close"),
                
                content =
                modal.createChild("p", "kbs-modal-content");
            
            // set title
            title.text(self.title);
            
            // close handler
            close.on("click", self.destroy);
            
            // append content from view
            content.addChild(self.view);
            
            // add modal to gui
            gui.addChild(modal);
            
            // open
            self.open();
        };
            
        // apply custom modal event handlers
        Modal.prototype.applyHandlers = function (params) {
            self = this;
            
            var err = function (event) {
                // warning
                util.log(
                    "warn",
                    "Modal '" +
                        self.viewName +
                        "' event '" +
                        event +
                        "' ran but didn't have a handler!"
                );
                
                // destroy modal
                self.destroy();
            }
            
            // confirmation
            this.onConfirm = params.confirm || function () {
                err("confirm");
            };
            
            // cancellation
            this.onCancel = params.cancel || function () {
                err("cancel");
            };
            
            // continuation
            this.onProceed = params.proceed || function () {
                err("proceed");
            };
        };
        
        // reveal modal and overlay
        Modal.prototype.open = function () {
            if (status.modal) {
                return;
            }
            
            status.modal = true;
            gui.tree.main.overlay.fadeIn();
            self.node.fadeIn();
        };
        
        // close modal and overlay
        Modal.prototype.close = function () {
            status.modal = false;
            gui.tree.main.overlay.hide();
            self.node.hide();
        };
        
        // destroy the modal
        Modal.prototype.destroy = function () {
            status.modal = false;
            gui.tree.main.overlay.hide();
            self.node.destroy();
            activeModals.splice(
                activeModals.indexOf(self.viewName),
                1
            );
        };
        
        // set gui instance
        Modal.prototype.setInstance = function (instance) {
            gui = instance;
        };

        return Modal;
    }
);
/*
*   @type javascript
*   @name interactor.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    'main/ui/interactor',[
        'config',
        'main/components/util',
        'main/components/events',
        'main/components/status',
        'main/components/node',
        'main/ui/modal'
    ],
    function (
        config,
        util,
        events,
        status,
        Node,
        Modal
    ) {
        

        // declarations
        var $,
            self,
            inited = false;

        // interactor constructor
        function Interactor() {
            util.log(
                "context:inter/init",
                "info",
                "Initialising Interactor..."
            );
            
            // set pointer
            self = this;
            
            // initialise
            this.init();
        }

        // initialise the interactor
        Interactor.prototype.init = function () {
            if (inited) {
                return;
            }
            
            // check jquery
            if (typeof window.jQuery !== "undefined") {
                // get
                $ = window.jQuery;
            } else {
                // no jquery, log error
                util.log(
                    "context:inter/init",
                    "error",
                    "Interactor could not initialise, jQuery not found!"
                );

                // and exit interactor
                return;
            }

            // apply elements and styling
            this.applyElements();
            this.applyHandlers();
            this.applyStyles();
            this.applyContext();
            this.applyHash();
            
            inited = true;
        };
            
        // returns if an object is or is apart of a task element
        Interactor.prototype.isTask = function (element) {
            // get jquery object
            if (!element instanceof $) {
                element = $(element);
            }
            
            element = element.closest("[id^=task_]");
            
            return (element.length) ? element : false;
        };
        
        // get the wrapper task element from a component
        Interactor.prototype.getTaskFromComponent = function (component) {
            return component.closest("[id^=task_]");
        };

        // expand the currently active task or a specified task id
        Interactor.prototype.openTask = function (localId) {
            util.log(
                "context:interactor",
                "Opening task #" + localId + "..."
            );
            
            if (typeof localId === "undefined") {
                this.expandTaskDetails();
                return;
            }
            
            // get global id
            this.findGlobalId(localId, function (task) {
                // once found - click the task
                task.trigger("click");
            });
        };

        // close the currently expanded task
        Interactor.prototype.closeTask = function () {
            this.shrinkTaskDetails();
        };

        // expands the task details panel
        Interactor.prototype.expandTaskDetails = function () {
            if (!$(".panelDetail").is(":visible")) {
                return;
            }
            
            // check current status
            if (status.interactor.taskDetailsExpanded) {
                return;
            }
            
            // show overlay
            $(".kbs-overlay").show();
            
            // add expansion class
            $(".taskDetails").hide().addClass("kbs-details-expand");
            
            // show elements
            setTimeout(function () {
                $(".taskDetails, .kbs-details-close").fadeIn();
            
                // trigger a resize event
                // so BugHerd can set the content height
                $(window).trigger("resize");
            }, 250);
            
            // set status
            status.interactor.taskDetailsExpanded = true;
        };

        // shrinks the task details panel
        Interactor.prototype.shrinkTaskDetails = function () {
            var task = $(".taskDetails"),
                overlay = $(".kbs-overlay"),
                btn = $(".kbs-details-close");
            
            if (!status.interactor.taskDetailsExpanded) {
                return;
            }
            
            // hide elements
            task.removeClass("kbs-details-expand");
            btn.fadeOut();
            overlay.fadeOut();
            
            // set status
            status.interactor.taskDetailsExpanded = false;
        };
            
        // perform a task search
        Interactor.prototype.searchForTask = function (localId, callback) {
            var search = $(".VS-search-inner input"),
                event = $.Event("keydown"),
                clear = $("div.VS-icon:nth-child(4)"),
                facet,
                result;
            
            util.log(
                "context:interactor",
                "Searching for task #" + localId
            );
            
            // down arrow
            event.keyCode = 40;
            
            // focus and nav to id
            search
                .focus()
                .trigger(event) // created
                .trigger(event) // filter
                .trigger(event); // id - bingo!
            
            // return key
            event.keyCode = 13;
            
            // press enter key to select id
            search.focus().trigger(event);
            
            // enter localId into input
            facet = $(".search_facet_input");
            facet
                .val(localId)
                .trigger("keydown");

            setTimeout(function () {
                // press enter
                facet.trigger(event);
            
                setTimeout(function () {
                    // callback with task
                    callback($(".task"));
                    
                    // unfocus from search
                    document.activeElement.blur();
                    
                    setTimeout(function () {
                        // clear search field
                        $("div.VS-icon:nth-child(4)").trigger("click");
                    }, 1000);
                }, 500);
            });
        };

        // find a global task id from a local task id
        Interactor.prototype.findGlobalId = function (localId, callback) {
            // declarations
            var tasks = $(".task-id, .taskID"),
                child,
                parent,
                globalId,
                errModal,
                errMsg,
                check = function (index) {
                    if ($(this)[0].textContent === localId.toString()) {
                        child = $(this);
                    }
                };

            // get current task id if none passed
            if (typeof localId === "undefined") {
                localId = $(".local_task_id")[0].textContent;
            }
            
            // find the right task
            tasks.each(check);

            // if nothing found - perform a task search (async!)
            if (typeof child === "undefined") {
                if (typeof callback === "undefined") {
                    util.log(
                        "context:interactor",
                        "error",
                        "Couldn't find global id for task #" + localId +
                            ". Provide a callback function to allow " +
                            "async task searches!"
                    );
                    return;
                }
                
                // async search for task - calls callback with result
                this.searchForTask(localId, function (task) {
                    if (self.findLocalIdFromTask(task) === localId) {
                        callback(task);
                    } else {
                        errMsg = "Couldn't find task #" + localId;
                        
                        util.log(
                            "context:interactor",
                            "error",
                            errMsg
                        );
                        
                        errModal = new Modal("small", {
                            init: true,
                            title: "Task search failed!",
                            message: errMsg
                        });
                    }
                });
                
                return;
            }
            
            // if found without asyn search - get and return
            parent = child.closest(".task");
            globalId = parent[0].id.replace("task_", "");

            // run callback with task/parent if defined
            if (callback) {
                callback(parent);
            }
            
            return globalId;
        };
            
        // find a local task id from a global task id
        Interactor.prototype.findLocalId = function (globalId) {
            $("#task_" + globalId).find(".task-id, .taskID").text();
        };
            
            
        // find a global task id from task element
        Interactor.prototype.findGlobalIdFromTask = function (task) {
            var parent = task.closest(".task"),
                globalId = parent[0].id.replace("task_", "");
            
            return globalId;
        };
            
        // find a local task id from task element
        Interactor.prototype.findLocalIdFromTask = function (task) {
            var parent = task.closest(".task"),
                localId = task.find(".task-id, .taskID").text();
            
            return localId;
        };

        // return current hash
        Interactor.prototype.getHash = function () {
            return window.location.hash;
        };
            
        // apply hash command
        Interactor.prototype.parseHash = function () {
            var hash = this.getHash(),
                href = window.location.href,
                hashId;
            
            util.log(
                "context:hash",
                "parsing new hash: " + hash
            );

            // prefixed
            if (hash === "#open") {
                // check if prefixed
                if (href.indexOf("tasks/") !== -1) {
                    hashId = parseInt(href.split("tasks/")[1], 10);

                    // open
                    if (hashId) {
                        this.openTask(hashId);
                    }
                }
            }

            // suffixed
            hashId = parseInt(hash.replace("#open", ""), 10);

            if (hashId) {
                this.openTask(hashId);
            }
        };

        // append elements to bugherd ui
        Interactor.prototype.applyElements = function () {
            // declarations
            var taskExpander,
                taskContractor,
                taskSearch;
            
            util.log(
                "context:inter/init",
                "+ appending elements to bugherd"
            );

            // task expander list element
            taskExpander = new Node("li");
            
            // task expander anchor element
            taskExpander.createChild("a")
                .text("Search Task")
                .on("click", function (event) {
                    taskSearch = new Modal("searchTask", {
                        init: true,
                        proceed: function (localId) {
                            if (!localId) {
                                // return if no id passed
                                return;
                            }
                            
                            taskSearch.destroy();
                            self.openTask(localId);
                        }
                    });
                });
            
            // task contractor/close button
            taskContractor = new Node("div", "kbs-details-close");
            taskContractor.createChild("i", "fa fa-times");
            taskContractor.on("click", function (event) {
                self.closeTask();
            });
            
            // write
            taskExpander.writeTo($(".nav.main-nav")[0]);
            taskContractor.writeTo($("body")[0]);
        };
            
        // apply event handlers
        Interactor.prototype.applyHandlers = function () {
            util.log(
                "context:inter/init",
                "+ applying handlers to bugherd"
            );
            
            // delegate clicks on app wrapper
            $(".app-wrap").on("click", function (event) {
                var target = $(event.target),
                    task = self.isTask(target);
                
                if (task) {
                    self.expandTaskDetails();
                }
            });
        };

        // apply new styling to bugherd ui
        Interactor.prototype.applyStyles = function () {
            util.log(
                "context:inter/init",
                "+ applying styles to bugherd"
            );

            // add a margin to user nav to accompany console controls
            $(".nav.user-menu").css("margin-right", "10px");
        };
            
        // apply interactor logging context / output
        Interactor.prototype.applyContext = function () {
            util.log(
                "context:inter/init",
                "+ applying interactor context"
            );
            util.log(
                "context:interactor",
                "info",
                "Interactor log output..."
            );
        };
            
        // apply hash lookup and event listeners
        Interactor.prototype.applyHash = function () {
            util.log(
                "context:inter/init",
                "+ applying hash parser"
            );
            
            var hash,
                href = window.location.href,
                hashId;
            
            util.log("context:hash", "info", "Hash events...");
            
            // open task if hash is prefixed
            // or suffixed with a task
            if (this.getHash()) {
                setTimeout(function () {
                    self.parseHash();
                }, 500);
            }
            
            // listening for hash events
            $(window).on("hashchange", function (event) {
                util.log(
                    "context:hash",
                    "hash changed: " + self.getHash()
                );
                
                self.parseHash();
            });
            
            if (this.getHash()) {
                util.log("context:hash", "found hash: " + this.getHash());
            }
        };

        return Interactor;
    }
);
/*
*   @type javascript
*   @name configurator.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    'main/components/configurator',[
        "config",
        "main/components/util",
        "main/ui/modal"
    ],
    function (config, util, Modal) {
        

        var self;
        
        // configurator class
        function Configurator() {
            self = this;
            
            this.modal = null;
            
            // modal
            this.modalProps = {
                init: true,
                title: "Settings",
                message: "Kanban configurator..."
            };
        }
        
        // start the configurator
        Configurator.prototype.start = function () {
            // initialise the modal
            self.modal = new Modal("userConfig", self.modalProps);
        };

        // finds a config setting from a selector string e.g. "gui/console/state"
        // will get config.gui.console.state
        Configurator.prototype.get = function (selector) {
            var i = 0,
                segments = selector.split("/"),
                value = config,
                len = segments.length;

            // iterate through segments
            for (i; i < len; i += 1) {
                // get segment value
                value = value[segments[i]];
            }

            return value;
        };

        // set/create a config value
        Configurator.prototype.set = function (selector, value) {
            var segments = selector.split("/"),
                len = segments.length,
                got = config,
                i = 0,
                parent;

            // if a simple selector
            if (segments.length === 1) {
                config[selector] = value;
                return config[selector];
            }

            // more complex selector - let's get references
            for (i; i < len; i += 1) {
                // if second to last segment, set as parent ref
                if (i === len - 2) {
                    parent = got[segments[i]];
                }
                got = got[segments[i]];
            }

            // set value
            parent[segments[len - 1]] = value;
            return parent[segments[len - 1]];
        };

        // reset config to default state
        Configurator.prototype.reset = function () {
            config.reset();
        };

        return Configurator;
    }
);

/*
*   @type javascript
*   @name router.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define('main/components/router',['config'], function (config) {
    
    
    return {
        // return a route to a component controller
        getRoute: function (component, fn) {
            return window.KBS_BASE_URL + config.routes[component][fn];
        }
    };
});
/*
*   @type javascript
*   @name console.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    'main/ui/console',[
        'config',
        'main/components/util',
        'main/components/events',
        'main/components/http',
        'main/components/status',
        'main/components/router',
        'main/components/cache',
        'main/components/node',
        'main/components/configurator',
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
        Node,
        Configurator,
        Modal
    ) {
        
            
        // instance pointers
        var self, gui,
            configurator;
        
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
                logContext = element.createChild("div", "kbs-log-context", context);
            } else {
                // manually append new Node
                logContext = new Node("div", "kbs-log-context", "kbs-ctx-" + context);
                element.appendChild(logContext.element);
            }
            
            // apply to global contexts
            this.contexts[context] = logContext.element;
            
            return element;
        };
            
        // clear/remove a logging context
        Console.prototype.clearContext = function (context) {
            var index;
            
            // don't allow clearing of def context
            if (context === "def") {
                return;
            }
            
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
                
                objwrap.addChild(objexp.element);
                objwrap.addChild(objtxt);
                log.addChild(objwrap.element);
            }
            
            // check if test node within exec node
            if (context.parentNode) {
                contextParent = context.parentNode.className;
                if ((args.type.match(/(test)|(buffer)/)) &&
                        util.contains(contextParent, "kbs-exec")) {
                    log.addClass("kbs-log-close");
                }
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
            self.wrapper.removeClass("kbs-close");
            self.wrapper.addClass("kbs-open");
        };
        
        // close console
        Console.prototype.close = function () {
            self.wrapper.removeClass("kbs-open");
            self.wrapper.addClass("kbs-close");
        };
        
        // refresh console
        Console.prototype.refresh = function () {
            // scroll to bottom of console
            var cons = self.wrapper.cons.element;
            cons.scrollTop = cons.scrollHeight;
        };
         
        // clear output
        Console.prototype.clear = function () {
            var cons = self.wrapper.cons.element,
                out = self.wrapper.cons.out.element,
                start = new Date().getTime(),
                deltaTime,
                count = 0;

            // detach
            cons.removeChild(out);

            // remove all logs
            while (out.firstChild) {
                count += 1;
                out.removeChild(out.firstChild);
            }

            // reattach
            cons.appendChild(out);
            
            // bench
            deltaTime = new Date().getTime() - start;
            util.log("okay", "cleared " + count + " logs in " + deltaTime + " ms");
            
            // clear buffer
            cache.console.clearBuffer();
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
                url: router.getRoute("console", "save"),
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
                
                modalMsg = "Confirm destruction of the GUI Console? " +
                "(irreversible until refresh).",
                
                modal = new Modal("destructConsole", {
                    init: true,
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
                        modal.destroy();
                    }
                });
        };
        
        // build the console
        Console.prototype.buildNodeTree = function () {
            // declarations
            var
                connection = (window.KBS_BASE_URL.indexOf("localhost") !== -1) ?
                        "local" : "remote",
            
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

            // console toolbar
            constools = wrapper.constools =
                wrapper.createChild("div", "kbs-cons-toolbar");

            // add a title to the toolbar
            constitle = constools.constitle =
                constools.createChild("div", "kbs-cons-title");

            titlenode = document.createTextNode(config.appFullname +
                    " v" + config.version + " - " + connection);
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
            
            // configurator tool
            configurator = new Configurator();
            this.createTool("settings")
                .element.onclick = configurator.start;
            
            // save tool - only on localhost base url's
            if (window.KBS_BASE_URL.indexOf("localhost") !== -1) {
                this.createTool("save")
                    .element.onclick = self.save;
            }
            
            // benchmark tool
            this.createTool("benchmark")
                .element.onclick = self.benchmark;
            
            // destroy tool
            this.createTool("destroy")
                .element.onclick = self.destroy;

            // clear tool
            this.createTool("clear")
                .element.onclick = self.clear;

            // close tool
            this.createTool("close")
                .element.onclick = self.close;

            // console
            wrapper.cons = cons =
                wrapper.createChild("div", "kbs-cons");

            // console output
            consout = cons.out = cons.createChild("div", "kbs-cons-out");

            // return wrapper element
            return wrapper;
        };
            
        // benchmarks the generation of log nodes
        Console.prototype.benchmark = function () {
            var cons = self.wrapper.cons.element,
                out = self.wrapper.cons.out.element,
                amount = 10000,
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
            while (i <= amount) {
                util.log("context:benchmark/output", "debug", "log #" + i);
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

define(
    'main/ui/gui',[
        'config',
        'main/components/util',
        'main/components/events',
        'main/components/counter',
        'main/components/node',
        'main/ui/console',
        'main/ui/modal'
    ],
    function (
        config,
        util,
        events,
        Counter,
        Node,
        Console,
        Modal
    ) {
        

        // instance pointer
        var self;

        util.log("+ gui.js loaded");

        // gui constructor
        function GUI() {
            // set pointer
            self = this;

            // pass our instance to Modal closure
            Modal.prototype.setInstance(this);
            
            // tree and console
            this.tree = this.buildNodeTree();
            this.console = new Console(this);

            // init
            this.init();

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
                loader = new Counter((config.offline) ? 2 : 3, function () {
                    events.publish("gui/loaded");
                }),

                // create link elements
                mainlink = document.createElement("link"),
                themelink = document.createElement("link"),
                falink = document.createElement("link"),

                // create urls
                mainurl = window.KBS_BASE_URL +
                "css/main.css",

                themeurl = window.KBS_BASE_URL +
                "css/themes/" + (config.theme || "default") + ".css",

                faurl = "//maxcdn.bootstrapcdn.com/font-awesome/" +
                "4.3.0" +
                "/css/font-awesome.min.css",

                // attach gui element and publish loaded event
                publish = function () {
                    // attach gui when styles have loaded
                    document.body.appendChild(self.tree.main.element);
                    util.log("context:gui/init", "+ attached gui tree");

                    // run event listeners
                    self.runEventListeners();

                    // publish the loaded event
                    events.publish("kbs/loaded");
                };

            // events setup
            if (config.gui.enabled) {
                // gui logging
                if (config.logs.gui) {
                    events.subscribe("gui/log", this.console.write);
                }

                // gui load event listener
                events.subscribe("gui/loaded", publish);
            }

            // props
            mainlink.rel = "stylesheet";
            themelink.rel = "stylesheet";
            falink.rel = "stylesheet";

            mainlink.href = mainurl;
            themelink.href = themeurl;
            falink.href = faurl;
            
            themelink.id = "kbs-theme-link";

            // gui init log context
            util.log("context:gui/init", "info", "Initialising GUI...");

            // main css link events
            mainlink.onload = function () {
                util.log("context:gui/init", "+ main.css loaded");
                loader.count += 1;
            };

            mainlink.onerror = function () {
                loader.count += 1;
                throw new Error("main.css failed to load!");
            };

            // theme css link events
            themelink.onload = function () {
                var themename = self.getThemeName();
                
                util.log("context:gui/init", "+ theme '" + themename + "' loaded");
                loader.count += 1;
            };

            themelink.onerror = function () {
                loader.count += 1;
                util.log("error", "theme '" +
                                self.getThemeName() +
                                "' failed to load!");
            };

            // font-awesome css link events
            falink.onload = function () {
                util.log("context:gui/init", "+ font-awesome.css loaded");
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
        };
            
        // return current theme name or theme name from url
        GUI.prototype.getThemeName = function (url) {
            var themelink = document.getElementById("kbs-theme-link"),
                name = url || themelink.href;
            
            name = name.replace(
                window.KBS_BASE_URL +
                    "css/themes/",
                ""
            );
            
            name = name.replace(".css", "");
            
            return name;
        };
            
        // return to configured theme
        GUI.prototype.resetTheme = function () {
            self.loadTheme(config.theme || "theme");
        };
            
        // set theme
        GUI.prototype.loadTheme = function (theme) {
            var themelink = document.getElementById("kbs-theme-link"),
                node = new Node(themelink);
            
            // remove .css if found
            theme = theme.replace(".css", "");
            
            // set theme
            node.attr(
                "href",
                window.KBS_BASE_URL +
                    "css/themes/" + theme + ".css"
            );
        };
            
        // remove current theme
        GUI.prototype.unloadTheme = function () {
            var themelink = document.getElementById("kbs-theme-link"),
                node = new Node(themelink);
            
            node.attr("href", "");
        };

        // build gui node tree
        GUI.prototype.buildNodeTree = function () {
            // create tree and nodes
            var tree = {}, main;

            // create nodes
            tree.main = main = new Node("div", "kbs-gui");
            main.overlay = main.createChild("div", "kbs-overlay");

            return tree;
        };

        // run event listeners
        GUI.prototype.runEventListeners = function () {
            util.log("context:gui/init", "+ running event listeners");
            
            // handle log node of type 'exec' clicks
            var out = this.console.wrapper.cons.out.element,
                current,
                togglables;

            // set togglables based on context state
            togglables = (config.logs.contexts) ?
                    [
                        "kbs-exec",
                        "kbs-test",
                        "kbs-buffer"
                    ] : "";

            // bind a click handler to the console out
            out.onclick = function (event) {
                current = new Node(event.target);
                if (current.hasClass(togglables)) {
                    if (!current.hasClass("kbs-log-close")) {
                        // we need to close the block
                        current.addClass("kbs-log-close");
                    } else {
                        // we need to open the block
                        current.removeClass("kbs-log-close");
                    }
                }
            };
        };


        // add a child node to the gui
        GUI.prototype.addChild = function (node) {
            this.tree.main.addChild(node);
        };

        // create a child and add to the gui
        GUI.prototype.createChild = function (type, classes, id) {
            var node = new Node(type, classes, id);
            this.addChild(node);
            return node;
        };

        // return the current gui instance
        GUI.prototype.getCurrentInstance = function () {
            return self;
        };

        // return gui
        return GUI;
    }
);
    

/*
*    @type javascript test
*    @name main.test.js
*    @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    'test/main.test',[
        'require',
        'main/components/util'
    ],
    function (require, util) {
        

        // instance pointer
        var self;

        // test controller constructor
        function TestController() {
            // modules
            this.modules = [
                "components/util",
                "components/events"
            ];
        }

        // executes a test
        TestController.prototype.exec = function (test) {
            // log
            util.log(
                "context:test/" + test,
                "exec",
                "executing test: \"" + test + "\"..."
            );

            // run
            require([window.KBS_BASE_URL + "test/" + test + ".test.js"]);
        };

        // executes all tests in the configured modules array
        TestController.prototype.execAll = function () {
            // declarations
            var len = this.modules.length,
                i = 0;

            // execute all
            for (i; i < len; i += 1) {
                this.exec(this.modules[i]);
            }
        };

        return new TestController();
    }
);
/*
*   @type javascript
*   @name init.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

/*
*   TODO
*   + Need to preserve user prefs and able to reset to defaults
*     (refactor config to monitor and cache states? Cookie parser?)
*
*   + Related to config, style/theme preference engine? Dynamic not preloaded?
*
*   + Add ability to set wallpapers (style/theme engine?)
*
*   + Add a comments interface/modal (with a spellchecker? Preview post?)
*
*   + A place for Kanban tools? Not attached to the console toolbar?
*
*   + Point base url to prodution cdn using source tag e.g
*     https://cdn.rawgit.com/HarryPhillips/BugHerd-Kanban/v1.3.0/
*
*   + Easier way to create complex elements like modals? View components?
*/

define(
    'main/init',[
        'config',
        'main/components/util',
        'main/ui/interactor',
        'main/components/events',
        'main/components/status',
        'main/components/cache',
        'main/components/http',
        'main/components/configurator',
        'main/ui/gui',
        'test/main.test'
    ],
    function (
        config,
        util,
        Interactor,
        events,
        status,
        cache,
        http,
        Configurator,
        GUI,
        tests
    ) {
        

        // components
        var kanban, end, gui, interactor;

        // check if disabled
        if (!config.enabled) {
            return;
        }

        // subscribe to status updates
        events.subscribe("kbs/status", function (data) {
            status[data.component] = data.status;
        });

        // initialise gui first so log buffer is constructed
        if (config.gui.enabled) {
            gui = new GUI();
        }

        // initialise interactor
        if (config.interactor.enabled) {
            interactor = new Interactor();
        }
            
        // execute kanban
        end = function () {
            // get performance delta
            window.KBS_DELTA_TIME =
                (new Date().getTime() - window.KBS_START_TIME) + "ms";

            // log
            util.log(
                "okay",
                kanban,
                "Kanban initialised in " +
                    window.KBS_DELTA_TIME
            );

            // expose the api if in dev mode
            if (config.mode === "dev") {
                window[config.appName] = kanban;
            }

            // expose logging api to window.log
            if (typeof window.log === "undefined") {
                window.log = util.log;
            }

            // update app status
            events.publish("kbs/status", {
                component: "app",
                status: true
            });

            // tests
            if (config.test) {
                tests.execAll();
            }
        };

        // kbs data/api object
        kanban = {
            version: config.version,
            interactor: interactor,
            status: status,
            cache: cache,
            config: config,
            events: events,
            http: http,
            util: util,
            gui: gui,
            configurator: new Configurator()
        };

        // wait for kbs loaded event
        events.subscribe("kbs/loaded", end);
    }
);

/*
*   @type javascript
*   @name kanban.js
*   @copy Copyright 2015 Harry Phillips
*/

(function (window) {
    
    
    var require = window.require,
        deposit = document.getElementById("kbs-deposit").classList;
    
    // process deposited values
    window.KBS_GLOBAL_SET = (deposit[0] === "true") ? true : false;
    window.KBS_START_TIME = deposit[1];
    window.KBS_DELTA_TIME = "";
    window.KBS_BASE_URL = deposit[2];
    
    require.config({
        paths: {
            main: window.KBS_BASE_URL + "src/main",
            test: window.KBS_BASE_URL + "src/test"
        }
    });
    
    // launch when window is loaded
    window.onload = function () {
        window.KBS_START_TIME = new Date().getTime();
        require(['main/init']);
    };
}(window));
define("kanban", function(){});

}());