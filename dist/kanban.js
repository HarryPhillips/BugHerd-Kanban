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
        version: "1.4.0",
        enabled: true,
        mode: "dev",
//        offline: true,
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

/*
*   TODO:
*   + Always pass the event name to the handler,
*     try to do this without disrupting passed parameters
*/

define('main/components/events',['config'], function (config) {
    
    
    function Events() {
        this.topics = {};
    }
    
    // subscribe/create event topic
    Events.prototype.subscribe = function (event, handler) {
        var len, i,
            attach = function (topic, handler) {
                if (!this.topics[topic]) {
                    // create an event topic
                    this.topics[topic] = [];
                }

                // apply handler to event
                this.topics[topic].push(handler);
            }.bind(this);
        
        // if event is an array of topics
        if (event instanceof Array) {
            len = event.length;
            i = 0;
            
            for (i; i < len; i += 1) {
                attach(event[i], handler);
            }
        } else {
            attach(event, handler);
        }
    };
    
    // unsubscribe a handler from a topic
    Events.prototype.unsubscribe = function (event, handler) {
        var list,
            object = false,
            xlen,
            ylen,
            x = 0,
            y = 0;
        
        // not a name - we need to do object comparison
        // we shouldn't need to do deep comparison,
        // the handlers *should* refer to the same object
        // in memory
        if (typeof handler !== "string") {
            object = true;
        }
        
        // convert event to array
        if (!event instanceof Array) {
            event = [event];
        }
        
        // remove all matched handlers from event
        for (x, xlen = event.length; x < xlen; x += 1) {
            // get event
            list = this.topics[event[x]];
                               
            // check names of all handlers
            for (y, ylen = list.length; y < ylen; y += 1) {
                // remove handler from array and return
                if (object) {
                    if (handler === list[y] ||
                            handler.toSource() === list[y].toSource()) {
                        list.splice(list.indexOf(y), 1);
                        return;
                    }
                } else {
                    if (list[y].name === handler) {
                        list[y].splice(list.indexOf(y), 1);
                        return;
                    }
                }
            }
        }
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
            this.topics[event][i](data, event);
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
        console: new Buffer(),
        logCount: 0
    };
    
    return cache;
});
/*
*   @type javascript
*   @name cookies.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define('main/components/cookies',['config'], function (config) {
    
    
    // cookies class
    function Cookies() {}
    
    // get a cookie by name
    Cookies.prototype.get = function (name) {
        var cname = config.cookies.prefix + name + "=",
            cookies = document.cookie.split(';'),
            cookie,
            i;

        // iterate through cookies
        for (i = 0; i < cookies.length; i += 1) {
            cookie = cookies[i];

            // eliminate whitespace
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1);
            }
            
            // return contents of cookie
            if (cookie.indexOf(cname) === 0) {
                return cookie.substring(cname.length, cookie.length);
            }
        }

        return "";
    };
    
    // set a cookie
    Cookies.prototype.set = function (name, value, days) {
        var expires, date;

        // set expiry
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
    };
    
    // delete a cookie
    Cookies.prototype.del = function (name) {
        this.set(name, "", -1);
    };
    
    // returns true if a cookie by name exists
    Cookies.prototype.exists = function (name) {
        var cookie = this.get(name);
        return cookie !== "" && cookie !== null && cookie !== undefined;
    };
    
    return Cookies;
});
/*
*   @type javascript
*   @name util.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

/*jslint regexp: true */

define(
    'main/components/util',[
        'config',
        'main/components/events',
        'main/components/status',
        'main/components/cache',
        'main/components/cookies',
        'main/components/buffer'
    ],
    function (
        config,
        events,
        status,
        cache,
        Cookies,
        Buffer
    ) {
        

        // util class
        function Util() {}
        
        // create new instance of Util
        var util = new Util();
            
        // refresh/reload the page with optional delay
        Util.prototype.refresh = function (delay) {
            if (typeof delay !== "undefined") {
                setTimeout(function () {
                    location.reload();
                }, delay);
            } else {
                location.reload();
            }
        };
        
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

                hours = util.zerofy(time.getHours()),
                minutes = util.zerofy(time.getMinutes()),
                seconds = util.zerofy(time.getSeconds()),
                millis = util.zerofy(time.getMilliseconds(), 3);

            return hours + ":" + minutes + ":" + seconds + "." + millis;
        };

        // returns current date as formatted string
        Util.prototype.fdate = function () {
            var time = new Date(),

                year = util.zerofy(time.getFullYear(), 4),
                month = util.zerofy(time.getMonth(), 2),
                date = util.zerofy(time.getDate(), 2);

            return year + "-" + month + "-" + date;
        };
            
        // get diff between two numbers
        Util.prototype.diff = function (num1, num2) {
            return (num1 > num2) ? num1 - num2 : num2 - num1;
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
            
        // run a series/array of functions
        Util.prototype.execAll = function (array, data) {
            var i = 0,
                len = array.length;
            
            // loop and run if a function is found
            for (i; i < len; i += 1) {
                if (util.isFunction(array[i])) {
                    array[i](data);
                }
            }
        };
        
        // cookie lib
        Util.prototype.cookie = new Cookies();
        
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
            
        // checks if input is a text node
        Util.prototype.isTextNode = function (obj) {
            return obj.nodeType === 3;
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
            if (
                typeof obj === "undefined" ||
                    util.isArray(obj)
            ) {
                return false;
            }
            
            return obj instanceof Object;
        };
            
        // check if input is a function
        Util.prototype.isFunction = function (obj) {
            return typeof obj === "function";
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
            
        // checks if a number is even
        Util.prototype.isEven = function (num) {
            return (num % 2) ? true : false;
        };
            
        // checks if a number is odd
        Util.prototype.isOdd = function (num) {
            return (num % 2) ? false : true;
        };
            
        // checks if a value is defined
        Util.prototype.isDefined = function (obj) {
            return typeof obj !== "undefined";
        };
            
        // matrix function
        Util.prototype.matrix = function (matrix) {
            var result,
                len = 6,
                i = 0,
                err = function (msg) {
                    util.log("warn", msg + " arguments supplied to kbs.util.matrix, " +
                            "unexpected results may occur");
                };
            
            // convert string matrices to arrays
            if (util.isString(matrix)) {
                // expecting: "matrix(a, b, c, d, tx, ty)"
                
                // check if matrix is in the string
                if (matrix.indexOf("matrix") !== -1) {
                    result = matrix.match(/\(([^)]+)\)/);
                    result = result[0].replace("(", "[").replace(")", "]");
                    result = util.unserialise(result);
                } else {
                    // try an unserialise as a fallback
                    result = util.unserialise(matrix);
                }
                
                return result;
            }
            
            // convert array to string matrices
            if (util.isArray(matrix)) {
                // expecting: [a, b, c, d, tx, ty]
                result = "";
                
                if (matrix.length < 6) {
                    err("Insufficient");
                }
                
                if (matrix.length > 6) {
                    err("Redundant");
                }
                
                // remove excess values
                matrix = matrix.slice(0, 6);
                
                // add missing values
                for (i = 0, len = 6; i < len; i += 1) {
                    if (!util.isDefined(matrix[i])) {
                        matrix[i] = 0;
                    }
                }
                
                // serialise array
                result = "matrix(" +
                    util.serialise(matrix).replace("[", "").replace("]", "") +
                    ")";
                
                return result;
            }
        };
            
        // capitalise the first letter of every word in string
        // doesn't support multiple whitespaces currently
        Util.prototype.capitalise = function (string) {
            var words = string.split(" "),
                len = words.length,
                i = 0,
                ch;
            
            // make every word capitalised
            for (i; i < len; i += 1) {
                ch = words[i].charAt(0).toUpperCase();
                words[i] = ch + words[i].slice(1);
            }
            
            // return words separated by one space
            return words.join(" ");
        };

        // returns true or the index
        Util.prototype.contains = function (host, target, strict) {
            var i = 0,
                y = 0,
                occs = [],
                regex,
                chk,
                temp;
            
            // make sure target and host are defined
            if (typeof host === "undefined") {
                // error if host is undefined
                util.log("error", "Could not determine a contained value, " +
                               "haystack object is undefined!");
                return false;
            }
            
            if (typeof target === "undefined") {
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
                target = util.escapeRegEx(target);

                // regex will match whole word of target only
                regex = new RegExp("(\\W|^)" + target + "(\\W|$)");

                return regex.test(host);
            };

            // default strict to false
            strict = strict || false;
            
            // host is array
            if (util.isArray(host)) {
                // recall with string
                for (i = 0; i < host.length; i += 1) {
                    temp = util.contains(host[i], target, strict);
                    
                    // matched
                    if (temp !== false) {
                        return temp;
                    }
                }
            } else {
                // target is array
                if (util.isArray(target)) {
                    // recall with string
                    for (i = 0; i < target.length; i += 1) {
                        temp = util.contains(host, target[i], strict);
                        
                        // matched
                        if (temp !== false) {
                            return temp;
                        }
                    }
                }
            }
            
            // compare two strings
            return chk(host, target);
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
            if (util.isDate(obj)) {
                copy = new Date();
                copy.setTime(obj.getTime());
                return copy;
            }
            
            // handle arrays
            if (util.isArray(obj)) {
                copy = [];
                len = obj.length;
                i = 0;
                
                // recursive copy
                for (i; i < len; i += 1) {
                    copy[i] = util.clone(obj[i]);
                }
                
                return copy;
            }
            
            // handle objects
            if (util.isObject(obj)) {
                copy = {};
                
                // recursive copy
                for (attr in obj) {
                    if (obj.hasOwnProperty(attr)) {
                        copy[attr] = util.clone(obj[attr]);
                    }
                }
                     
                return copy;
            }
            
            // handle simple types
            if (util.isString(obj)
                    || util.isNumber(obj)
                    || util.isBoolean(obj)) {
                copy = obj;
                return copy;
            }
            
            // error if uncaught type
            util.log(
                "error",
                "Couldn't clone object of unsupported type: " +
                    typeof obj
            );
        };
        
        // merge two objects
        Util.prototype.merge = function (one, two, overwrite) {
            var duplicate,
                exists,
                len,
                i;
            
            // object merge
            if (util.isObject(one)) {
                // loop through all two's props
                // and push into one
                for (i in two) {
                    if (two.hasOwnProperty(i)) {
                        exists = typeof one[i] !== "undefined";

                        if (!exists || (exists && overwrite)) {
                            if (util.isObject(two[i])) {
                                util.merge(one[i], two[i], overwrite);
                            } else {
                                one[i] = two[i];
                            }
                        }
                    }
                }
            }
            
            // array merge
            if (util.isArray(one)) {
                // loop through all two's items
                // and push into one
                duplicate = overwrite;
                len = two.length;
                i = 0;
                for (i; i < len; i += 1) {
                    if (!util.contains(one, two[i]) || duplicate) {
                        one.push(two[i]);
                    }
                }
            }
            
            return one;
        };

        // serialise a data structure
        Util.prototype.serialise = function (object, json) {
            var index,
                result,
                length,
                props,
                value,
                separate = false;
            
            // default to not using json lib
            json = (typeof json !== "undefined") ? json : false;
            
            // this should capture simple types
            // e.g. strings and numbers
            result = object;
            
            // serialise object
            if (util.isObject(object)) {
                if (json) {
                    result = JSON.stringify(object);
                } else {
                    result = "{";
                    props = util.listProperties(object);
                    separate = true;

                    // add each element to result string
                    for (index in object) {
                        if (object.hasOwnProperty(index)) {
                            // add object value?
                            result += "\"" + index + "\":" +
                                util.serialise(object[index], json);

                            // if is last element
                            if (props.indexOf(index) === props.length - 1) {
                                separate = false;
                            }

                            // separate?
                            if (separate) {
                                result += ", ";
                            }
                        }
                    }

                    result += "}";
                }
            }
            
            // serialise array
            if (util.isArray(object)) {
                index = 0;
                length = object.length;
                result = "[";
                
                // add each element to result string
                for (index; index < length; index += 1) {
                    separate = index > 0 && index !== length;
                    
                    // need to separate?
                    if (separate) {
                        result += ", ";
                    }
                    
                    value = object[index];
                    
                    // push to result
                    if (util.isString(value)) {
                        result += "\"" + value + "\"";
                    } else if (util.isNumber(value)) {
                        result += value;
                    } else {
                        result += util.serialise(value, json);
                    }
                }
                     
                result += "]";
            }
            
            // wrap string with "'s
            if (util.isString(object)) {
                return "\"" + result + "\"";
            }
            
            return result;
        };
        
        // unserialise a data structure
        Util.prototype.unserialise = function (string, json) {
            var result, parts,
                index, length,
                props;
            
            // default to use json lib (no object parser yet)
            json = (typeof json !== "undefined") ? json : true;
            
            // parse an array from string
            function parseArray(str) {
                var result = [], value = "",
                    nstruct = new RegExp(/(\[)|(\{)/g),
                    estruct = new RegExp(/(\])|(\})/g),
                    instr = false,
                    strch, eov, len, ch, pch,
                    depth = 0, i = 0;
                
                // clean up the string
                str = str.replace(/\s,*/g, "");
                str = str.replace(/,\s*/g, ",");
                str = str.substring(1, str.length - 1);
                
                len = str.length;
                
                // walk through string and pick up values
                do {
                    // get chars
                    pch = str.charAt(i - 1);
                    ch = str.charAt(i);
                    
                    // check if string
                    if (ch === "'" || ch === '"') {
                        // string char found
                        if (pch !== "\\" && ch === strch) {
                            // not escaped
                            if (instr && ch === strch) {
                                // ended a string
                                instr = false;
                                strch = "";
                            } else if (!instr) {
                                // entering a new string
                                instr = true;
                                strch = ch;
                            }
                        }
                    }
                  
                    // new structure - increase depth
                    if (nstruct.test(ch) && !instr) {
                        depth += 1;
                    }
                    
                    // end of structure - decrease depth
                    if (estruct.test(ch) && !instr) {
                        depth -= 1;
                    }
                    
                    // end of value flagged
                    eov = ((ch === "," || estruct.test(ch))
                           && !depth // not in a structure
                           && !instr); // not in a string
                    
                    // end of current value - unserialise it and continue
                    if (eov || i === len) {
                        result.push(util.unserialise(value, json));
                        value = "";
                    } else {
                        // add char to current value
                        value += ch;
                    }
                    
                    // next char
                    i += 1;
                } while (i <= len);
                
                return result;
            }
            
            // parse an object from string (not json)
            function parseObject(str) {
                var original = str,
                    result = {},
                    index = 0,
                    wrkstr,
                    ch;
                
                // clean the string
                str = str.replace(/(:\s)/g, ":");
                str = str.replace(/(\s\{)/g, "{");
                str = str.replace(/(\{\s)/g, "{");
                str = str.replace(/(\s\})/g, "}");
                str = str.replace(/(\}\s)/g, "}");
                
                // TODO(harry): write an object parser...
                
                return result;
            }
            
            // parse a string
            function parseString(str) {
                var quote = /(')|(")/g;
                
                // get value between quotes
                if (str.charAt(0).match(quote) &&
                        str.charAt(str.length - 1).match(quote)) {
                    str = str.substring(1, str.length - 1);
                } else {
                    // check if number - return string if not
                    if (isNaN(parseFloat(str, 10))) {
                        return str;
                    } else {
                        str = parseFloat(str, 10);
                    }
                }
                
                return str;
            }
            
            // this should capture simple types
            result = string;
            
            // catch numbers and already parsed values
            if (util.isNumber(string) ||
                    util.isObject(string) ||
                    util.isArray(string)) {
                return string;
            }
            
            // serialised array
            if (string.charAt(0) === "[") {
                return parseArray(string);
            }
            
            // serialised object
            if (string.charAt(0) === "{") {
                if (json) {
                    return JSON.parse(string);
                } else {
                    return parseObject(string);
                }
            }
            
            // catch uncaught strings
            if (util.isString(string)) {
                return parseString(string);
            }
            
            return result;
        };
        
        // return an array of properties on an object
        Util.prototype.listProperties = function (obj) {
            var list = [],
                index;
            
            if (!util.isObject(obj)) {
                return;
            }
            
            for (index in obj) {
                if (obj.hasOwnProperty(index)) {
                    list.push(index);
                }
            }
            
            return list;
        };
            
        // returns *approximated* object size in bytes
        Util.prototype.sizeof = function (object) {
            var bytes = 0,
                len,
                i;
            
            if (object !== null && object !== undefined) {
                switch (typeof object) {
                case "string":
                    bytes += object.length * 2;
                    break;
                case "number":
                    bytes += 8;
                    break;
                case "boolean":
                    bytes += 4;
                    break;
                case "object":
                    // object
                    if (util.isObject(object)) {
                        for (i in object) {
                            if (object.hasOwnProperty(i)) {
                                bytes += util.sizeof(object[i]);
                            }
                        }
                    }
                        
                    // array
                    if (util.isArray(object)) {
                        len = object.length;
                        i = 0;
                        
                        for (i; i < len; i += 1) {
                            bytes += util.sizeof(object[i]);
                        }
                    }
                    
                    break;
                }
            }
            
            return bytes;
        };
            
        // format number to bytes
        Util.prototype.bytesFormat = function (x) {
            // bytes
            if (x < 1014) {
                return x + "bytes";
            }
            
            // kilobytes
            if (x < 1048576) {
                return (x / 1024).toFixed(3) + "KB";
            }
            
            // megabytes
            if (x < 1073741824) {
                return (x / 1048576).toFixed(3) + "MB";
            }
            
            // gigabytes
            return (x / 1073741824).toFixed(3) + "GB";
        };
        
        // log wrapper
        Util.prototype.log = function (context, type, msg, opt) {
            // check if logs are enabled
            if (!config.logs.enabled) {
                return;
            }

            // increment log count
            cache.logCount += 1;
            
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
                        if (util.log.currentContext !== false) {
                            // we have an active context
                            // create a subcontext
                            subcontext = context.replace(ctxFlag, "");
                            context = util.log.currentContext;
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
                        context = util.log.currentContext;
                    }
                } else {
                    ctxArgsAdjust();
                    context = util.log.currentContext;
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
                if (util.contains(filter, type, true) !== false) {
                    return;
                }
            }

            // format and push output
            str += util.ftime();
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
        
        // current logging context
        Util.prototype.log.currentContext = util.log.currentContext || false;
        
        // begin a continuous logging context
        Util.prototype.log.beginContext = function (context) {
            // return if disabled
            if (!config.logs.contexts) {
                return;
            }
            
            if (context.indexOf(config.logs.contextFlag) !== -1) {
                util.log("error", "You shouldn't pass the context flag " +
                               "when using beginContext()");
                return;
            }
            
            util.log.currentContext = context;
        };
        
        // end a continuous logging context
        Util.prototype.log.endContext = function () {
            util.log.currentContext = false;
        };
        
        // clear/remove a logging context
        Util.prototype.log.clearContext = function (context) {
            events.publish("gui/contexts/clear", context);
        };
            
        // logging aliases
        Util.prototype.debug = function () {
            util.log("debug");
        };
        Util.prototype.warn = function () {
            util.log("warn");
        };
        Util.prototype.error = function () {
            util.log("error");
        };
        
        // log
        util.log("+ util.js loaded");

        // return instance
        return util;
    }
);

/*
*   @type javascript
*   @name exception.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define('main/components/exception',["main/components/util"], function (util) {
    
    
    function Exception(err, msg) {
        this.fileName = err.fileName;
        this.lineNumber = err.lineNumber;
        this.message = err.message;
        
        util.log(
            "error",
            msg + " | Exception thrown in " +
                err.fileName + " at line " +
                err.lineNumber + ". Error: " +
                err.message
        );
    }
    
    return Exception;
});
/*
*   @type javascript
*   @name repository.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define('main/components/repository',[],function () {
    

    // shared
    var box = {},
        instance;

    // repository class
    function Repository() {}

    // add an object to the repo under key
    Repository.prototype.add = function (key, object) {
        // already exists
        if (box[key]) {
            throw new Error(
                "Couldn't add '" + key + "' to the repository, " +
                    " key already exists. Delete the key first."
            );
        }

        box[key] = object;
    };

    // get an object from the repo
    Repository.prototype.get = function (key) {
        return box[key];
    };

    // delete an object from the repo
    Repository.prototype.del = function (key) {
        delete box[key];
    };
    
    // list all repo objects
    Repository.prototype.all = function () {
        return box;
    };

    return Repository;
});
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

define('main/components/viewloader',['require'],function (require) {
    
    
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
*   @name node.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    'main/ui/node',['config', 'main/components/util'],
    function (config, util) {
        
        
        // instance monitoring
        var ALL_NODES = [];
        
        // node constructor
        function Node(type, classes, id) {
            // is a selector passed
            if (util.isString(type)) {
                if (type.charAt(0) === "#" || type.charAt(0) === ".") {
                    return new Node(document.querySelector(type), classes, id);
                }
            }
            
            // check if a node with this exact element
            // already exists - if it does, return it
            var len = ALL_NODES.length,
                assoc = this.findAssociatedNode(type),
                i = 0;
            
            
            // return associated Node instance if found
            if (assoc) {
                return assoc;
            }
            
            // update instance monitor
            ALL_NODES.push(this);
            
            // props
            this.children = [];
            this.textNodes = [];
            
            // check if passed an HTML node
            if (util.isDomElement(type)) {
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
            return this;
        };
        
        // hide node
        Node.prototype.hide = function () {
            this.element.style.display = "none";
            return this;
        };
        
        // toggle node
        Node.prototype.toggle = function () {
            var method = (this.element.style.display === "none") ? "block" : "none";
            this.element.style.display = method;
            return this;
        };
        
        // fade in node
        Node.prototype.fadeIn = function (args) {
            if (typeof window.jQuery === "undefined") {
                this.show();
                return this;
            }
            
            // jquery fade in
            window.jQuery(this.element).fadeIn(args);
            
            return this;
        };
        
        // fade out node
        Node.prototype.fadeOut = function (args) {
            if (typeof window.jQuery === "undefined") {
                this.hide();
                return this;
            }
            
            // jquery fade out
            window.jQuery(this.element).fadeOut(args);
            
            return this;
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
            if (this.element.className.indexOf(classes) !== -1) {
                return;
            }
            
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
                    this.removeClass(classes[i]);
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
        
        // toggles a class on a node
        Node.prototype.toggleClass = function (name) {
            if (this.hasClass(name)) {
                this.removeClass(name);
            } else {
                this.addClass(name);
            }
        };
        
        // css rule changes
        Node.prototype.css = function (rule, property, after) {
            var rules = rule.split("-"),
                i;
            
            // if more than one piece to rule name
            if (rules.length > 1) {
                // capitalise names after first name
                for (i = 1; i < rules.length; i += 1) {
                    rules[i] = util.capitalise(rules[i]);
                }
            }
            
            // join to form new rule
            rule = rules.join("");
            
            // get or set?
            if (typeof property === "undefined" || property === "") {
                // return computed style
                return window.getComputedStyle(this.element, null).getPropertyValue(rule);
            } else {
                this.element.style[rule] = property;
            }
            
            return this;
        };
        
        // return computed style
        Node.prototype.getComputedStyle = function (rule) {
            return window.getComputedStyle(this.element, null).getPropertyValue(rule);
        };
        
        // get parent node
        Node.prototype.parent = function () {
            if (!this.element) {
                return null;
            }
            
            return this.element.parentNode;
        };
        
        // add a child to node
        Node.prototype.addChild = function (child) {
            // check if child is an instance of class Node
            if (child.constructor === Node || child instanceof Node) {
                this.element.appendChild(child.element);
                this.children.push(child);
                return child;
            }
            
            // if is a dom element, then call add again
            if (util.isDomElement(child)) {
                child = new Node(child);
                return this.addChild(child);
            }
            
            // if is a text node just append
            if (util.isTextNode(child)) {
                this.textNodes.push(child);
                this.element.appendChild(child);
                return child;
            }
            
            // failed
            util.log(
                "error",
                this,
                "Attempt to add a child element to Node failed, " +
                    "child is not of type Node or HTMLElement."
            );
        };

        // create and add child to node
        Node.prototype.createChild = function (type, classes, id) {
            var child = new Node(type, classes, id);
            this.addChild(child);
            return child;
        };
        
        // detach from parent
        Node.prototype.detach = function () {
            return this.element.parentNode.removeChild(this.element);
        };
        
        // (re)attach to parent
        Node.prototype.attach = function () {
            this.element.parentNode.appendChild(this.element);
        };
        
        // move to another element
        Node.prototype.move = function (destination) {
            var el = this.detach();
            
            // attach to destination
            if (util.isNode(destination)) {
                destination.addChild(el);
            } else if (util.isDomElement(destination)) {
                destination.appendChild(el);
            }
        };
        
        // translate the element by (x, y)
        Node.prototype.translate = function (x, y) {
            // get current matrix settings in string form
            var currMatrix = this.css("transform"),
                matrix;
        
            if (currMatrix === "none") {
                // if no matrix found just create one
                matrix = [0, 0, 0, 0, x, y];
            } else {
                // get array of matrix
                matrix = util.matrix(currMatrix);
                
                // add x & y values to matrix
                matrix[4] = x;
                matrix[5] = y;
            }
            
            // reserialise matrix to string
            matrix = util.matrix(matrix);
            
            // apply new transformation matrix
            this.css("transform", matrix);
        };
        
        // scales the element to val
        Node.prototype.scale = function (val) {
            // get current matrix settings in string form
            var currMatrix = this.css("transform"),
                matrix;
            
            if (currMatrix === "none") {
                // no matrix found so create new
                matrix = [val, 0, 0, val, 0, 0];
            } else {
                // get array of current matrix
                
                // set scale (a & d / 0 & 3)
                matrix[0] = val;
                matrix[3] = val;
            }
            
            // reserialise the matrix to a string
            matrix = util.matrix(matrix);
            
            // apply the transformation
            this.css("transform", matrix);
        };
        
        // get node x
        Node.prototype.getBounds = function (pos) {
            var bounds = this.element.getBoundingClientRect();
            
            // center of element
            if (pos === "center") {
                return util.diff(bounds.left, bounds.right) / 2;
            }
            
            return bounds[pos];
        };
        
        // delete and reset node and it's children
        Node.prototype.destroy = function () {
            var xlen = this.children.length,
                ylen = ALL_NODES.length,
                x = 0,
                y = 0;
            
            // call destroy on children
            if (xlen) {
                for (x; x < xlen; x += 1) {
                    if (this.children[x]) {
                        this.children[x].destroy();
                        this.children[x] = null;
                    }
                }
            }
            
            // remove from global node list
            if (ylen) {
                for (y; y < ylen; y += 1) {
                    if (ALL_NODES[y]) {
                        if (ALL_NODES[y].element === this.element) {
                            ALL_NODES.splice(y, 1);
                        }
                    }
                }
            }
            
            // nullify if no parent node
            if (!this.parent()) {
                this.element = null;
                return;
            }
            
            // remove from DOM by detaching from parent
            this.parent().removeChild(this.element);
        };
        
        // find occurences of an element by selector within this node
        // always returns as an array
        Node.prototype.find = function (selector) {
            var nodeList = this.element.querySelectorAll(":scope " + selector),
                len = nodeList.length,
                results = [],
                i = 0;
            
            // iterate over results
            // convert to Node - will get existing
            // node if element is already a node
            for (i; i < len; i += 1) {
                results.push(new Node(nodeList[i]));
            }
            
            return results;
        };
        
        // clear a node of its children
        Node.prototype.clear = function () {
            var i = 0,
                len = this.children.length;
            
            for (i; i < len; i += 1) {
                this.children[i].destroy();
            }
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
            if (typeof value === "undefined") {
                return this.element.getAttribute(name);
            }
            
            this.element.setAttribute(name, value);
            return this;
        };
        
        // write or return node text
        Node.prototype.text = function (text, clear) {
            if (typeof text === "undefined") {
                return this.element.textContent
                    || this.element.value;
            }
            
            if (clear) {
                this.element.textContent = "";
                this.element.value = "";
            }
            
            text = document.createTextNode(text);
            this.addChild(text);
            return this;
        };
        
        // set value of a node
        Node.prototype.val = function (value) {
            if (typeof value === "undefined") {
                // select element case
                if (this.element.nodeName === "SELECT") {
                    return this.element.selectedOptions[0].value;
                }
                
                return this.element.value;
            }
            
            this.element.value = value;
            return this;
        };
        
        // add node event handler
        Node.prototype.on = function (event, listener) {
            this.element.addEventListener(event, listener);
            return this;
        };
        
        // remove node event handler
        Node.prototype.off = function (event, listener) {
            this.element.removeEventListener(event, listener);
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
        
        // checks if node has child nodes
        Node.prototype.hasChildren = function () {
            return this.children.length;
        };
        
        // checks if the node's element matches this element
        Node.prototype.is = function (element) {
            return this.element === element;
        };
        
        // find the node which belongs to passed element
        Node.prototype.findAssociatedNode = function (element) {
            var len = ALL_NODES.length,
                i = 0;
            
            for (i; i < len; i += 1) {
                if (ALL_NODES[i].element === element) {
                    return ALL_NODES[i];
                }
            }
            
            return false;
        };
        
        // monitoring
        Node.prototype.count = function () {
            return ALL_NODES.length;
        };
        
        Node.prototype.ALL_NODES = ALL_NODES;
        
        return Node;
    }
);
/*
*   @type javascript
*   @name modal.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */
define(
    'main/ui/modal',[
        'config',
        'main/components/util',
        'main/components/events',
        'main/components/status',
        'main/components/repository',
        'main/components/http',
        'main/components/viewloader',
        'main/ui/node'
    ],
    function (config,
        util, events,
        status, repo, Http,
        ViewLoader, Node) {
        
        
        // event logger
        function evtlog(modal, event) {
            util.log(
                "context:gui",
                "debug",
                "Modal '" + modal.viewName + "' " +
                    "event '" + event + "' fired"
            );
        }
        
        // global/shared variables
        var gui,
            vloader = new ViewLoader(),
            ctrl;
        
        /* ModalController Class
        ---------------------------------------------*/
        function ModalController() {
            // list of all modal objects/arrays
            this.list = {};
            
            // modal states
            this.active = null;
            this.stacked = [];
            this.opened = [];
            
            // queue processing
            events.subscribe(
                [
                    "gui/modal/open",
                    "gui/modal/close",
                    "gui/modal/destruct"
                ],
                this.processStack.bind(this)
            );
            
            // events list
            this.events = [
                "init", "load", "reload", "open", "close",
                "destruct", "confirm", "proceed", "cancel"
            ];
            
            var len = this.events.length,
                i = 0;
            
            // event logging
            for (i; i < len; i += 1) {
                events.subscribe(
                    "gui/modal/" + this.events[i],
                    evtlog
                );
            }
        }
        
        // begin processing the modal queue
        ModalController.prototype.processStack = function processStack(data, event) {
            var active = this.active,
                opened = this.opened,
                stacked = this.stacked,
                
                modal = data;
            
            util.log("context:gui", "debug", "processing modal stack");
            
            // new modal opened
            if (event === "gui/modal/open") {
                // push current modal into stack
                if (active && !active.dueRemoval) {
                    this.addToStack(active);
                }
                
                this.addToOpened(modal);
            }
            
            // modal closed - re-open first in stack
            if (event === "gui/modal/close") {
                // if in stack, remove it
                if (this.isStacked(modal)) {
                    this.removeFromStack(modal);
                }
                
                if (stacked.length) {
                    // take out new modal from stack and open it
                    modal = stacked[stacked.length - 1];
                    modal.open();
                    this.removeFromStack(modal);
                } else if (!opened.length) {
                    // reset
                    this.active = null;
                    gui.preserveOverlay = false;
                    
                    if (!status.interactor.taskDetailsExpanded) {
                        gui.hideOverlay();
                    }
                }
                
                this.removeFromOpened(modal);
            }
            
            // should preserve overlay?
            if (stacked.length || opened.length) {
                gui.preserveOverlay = true;
            }
        };
        
        // adds a modal to the stack
        ModalController.prototype.addToStack = function (modal, index) {
            util.log(
                "context:gui",
                "debug",
                "Adding modal '" + modal.viewName + "' to stack"
            );
            
            // add stacked class
            modal.node.addClass("kbs-stacked");
            
            // push to stack
            if (!index) {
                this.stacked.push(modal);
            } else {
                this.stacked[index] = modal;
            }
            
            // shift stack
            this.shiftStack();
        };
        
        // removes a modal from the stack
        ModalController.prototype.removeFromStack = function (modal) {
            var array = this.stacked,
                index = array.indexOf(modal);
            
            // remove from stack
            this.stacked.splice(index, 1);
            
            // remove stacked class
            modal.node.removeClass("kbs-stacked");
            
            // shift stack
            this.shiftStack();
            
            util.log(
                "context:gui",
                "debug",
                "Removed modal '" + modal.viewName + "' from stack"
            );
        };
        
        // shifts elements in the stack
        ModalController.prototype.shiftStack = function () {
            var stack = this.stacked,
                len = stack.length,
                i = 0,
                modal,
                offset;
            
            if (!this.getBehaviour("shift")) {
                return;
            }
            
            util.log(
                "context:gui",
                "debug",
                "shifting stack"
            );
            
            for (i; i < len; i += 1) {
                modal = stack[i];
                
                // remove initial shift classes
                modal.node.removeClass("kbs-shift-left");
                modal.node.removeClass("kbs-shift-right");
                
                // get an offset
                if (i !== 0) {
                    if (util.isEven(i)) {
                        offset = "kbs-shift-left";
                    }

                    if (util.isOdd(i)) {
                        offset = "kbs-shift-right";
                    }

                    modal.node.addClass(offset);

                    util.log(
                        "context:gui",
                        "debug",
                        "set offset of " + offset + " to '" +
                            modal.viewName + "'"
                    );
                }
            }
        };
        
        // swap active modal with one in stack
        ModalController.prototype.swapStack = function (index) {
            var active = this.active,
                opened = this.opened,
                stacked = this.stacked,
                modal;
            
            // passed an index
            if (util.isNumber(index)) {
                modal = stacked[index];
                return;
            }
            
            // passed a modal view name
            if (util.isString(index)) {
                modal = this.getModalByName(index);
            }
            
            // passed a modal object
            if (util.isObject(index)) {
                modal = index;
            }
            
            // remove clicked from stack
            this.removeFromStack(modal);
            
            // update stack positions
            this.shiftStack();
            
            // add active modal to stack
            this.addToStack(active);
            
            // set active modal
            this.active = modal;
        };
        
        // returns index for modal in stack
        ModalController.prototype.getStackIndex = function (modal) {
            var stacked = this.stacked,
                len = stacked.length,
                i = 0;
            
            for (i; i < len; i += 1) {
                if (stacked[i] === modal) {
                    return i;
                }
            }
        };
        
        // add a new modal instance
        ModalController.prototype.addModal = function (modal) {
            this.list[modal.viewName] = modal;
        };
        
        // remove a modal instance
        ModalController.prototype.removeModal = function (modal) {
            delete this.list[modal.viewName || modal];
        };
        
        // adds a modals to the queue
        ModalController.prototype.addToQueue = function (modal) {
            this.queued.push(modal);
        };
        
        // removes a modal from the queue
        ModalController.prototype.removeFromQueue = function (modal) {
            var array = this.queued,
                index = array.indexOf(modal.viewName || modal);
            
            this.queued.splice(index, 1);
        };
        
        // adds a modal to the opened modals array
        ModalController.prototype.addToOpened = function (modal) {
            this.opened.push(modal);
        };
        
        // removes a modal from the opened modals array
        ModalController.prototype.removeFromOpened = function (modal) {
            var array = this.opened,
                index = array.indexOf(modal.viewName || modal);
            
            this.opened.splice(index, 1);
        };
        
        // checks if a modal is active
        ModalController.prototype.isActive = function (modal) {
            return this.active === modal;
        };
        
        // checks if a modal is open
        ModalController.prototype.isOpen = function (modal) {
            return this.opened.indexOf(modal) !== -1;
        };
        
        // checks if a modal is queued
        ModalController.prototype.isQueued = function (modal) {
            return this.queued.indexOf(modal) !== -1;
        };
        
        // checks if a modal is stacked
        ModalController.prototype.isStacked = function (modal) {
            return this.stacked.indexOf(modal) !== -1;
        };
        
        // returns a modal by view name
        ModalController.prototype.getModalByName = function (name) {
            return this.list[name];
        };
        
        // checks if a modal exists
        ModalController.prototype.exists = function (name) {
            var exists = false,
                modal = this.getModalByName(name);
            
            // check definition
            if (typeof modal !== "undefined" && modal !== null) {
                exists = true;
            }
            
            return exists;
        };
        
        // checks a behaviour setting
        ModalController.prototype.getBehaviour = function (name) {
            return config.gui.modals.behaviour[name];
        };
        
        // modal controller instance
        ctrl = new ModalController();
        
        /* Modal Class
        ---------------------------------------------*/
        function Modal(view, params) {
            // default params
            params = params || {init: true};
            
            if (typeof params.init === "undefined") {
                params.init = true;
            }
            
            // return current instance
            // if already exists
            if (ctrl.exists(view)) {
                var modal = ctrl.getModalByName(view);
                
                // if stacked
                if (ctrl.isStacked(modal)) {
                    ctrl.swapStack(modal);
                    return modal;
                }
                
                // check if call to init
                if (params.init) {
                    modal.init();
                }
                
                return modal;
            }
            
            // store props
            this.viewName = view;
            this.viewParams = params.viewParams || {};
            this.params = params;
            this.classes = params.classes || "";
            this.inited = false;
            this.loaded = false;
            
            // setup event
            this.createEvents();
            
            // create and hide node
            this.node = new Node("div", "kbs-modal kbs-" + view);
            this.node.addClass(this.classes);
            this.node.hide();
            
            // shield node
            this.shieldNode = this.node.createChild("div", "kbs-modal-shield");
            
            // view element
            this.view = null;
            
            // this should fix the 'this' refs
            // for when our methods are called
            // by external modules
            this.init = this.rInit.bind(this);
            this.open = this.rOpen.bind(this);
            this.close = this.rClose.bind(this);
            this.destroy = this.rDestroy.bind(this);
            
            // set modal event handlers
            this.applyHandlers(params);
            
            // load view and init
            this.load((params.init) ? this.init : function () {});
            
            // add modal to controller
            ctrl.addModal(this);
        }
        
        // setup and create modal events
        Modal.prototype.createEvents = function () {
            var x = 0, y,
                len = ctrl.events.length,
                evtcreate = function () {};
            
            // setup modal specific events
            this.eventName = {};
            for (x; x < len; x += 1) {
                this.eventName[ctrl.events[x]] = "gui/modal/" +
                    this.viewName + x;
            }
            
            // loop through events and create them
            for (y in this.eventName) {
                if (this.eventName.hasOwnProperty(y)) {
                    events.subscribe(this.eventName[y], evtcreate);
                }
            }
        };
        
        // load view into modal
        Modal.prototype.load = function (callback) {
            var self = this,
                params = this.viewParams,
                view;
            
            // return if already loaded
            if (this.loaded) {
                return;
            }
            
            this.loaded = true;
            
            vloader.load(
                "modals/" + this.viewName,
                function (mod) {
                    // get new view
                    view = mod.draw([gui, self, params]);
                    
                    // set view to modal
                    self.view = view;
                    self.viewModule = mod;
                    self.title = view.title;
                    
                    // publish
                    self.trigger("load", self);
                    
                    // run callback
                    if (util.isFunction(callback)) {
                        callback();
                    }
                }
            );
        };
        
        // reload modal a modals content
        Modal.prototype.reload = function (page) {
            var self = this,
                view = this.viewModule,
                render = view.draw([gui, self, self.viewParams], page),
                content = this.node.find(".kbs-modal-content")[0];
            
            content.clear();
            content.addChild(render);
            this.trigger("reload", this);
        };
        
        // attach an event handler to modal
        Modal.prototype.on = function (event, handler) {
            try {
                events.subscribe(
                    this.eventName[event],
                    handler
                );
            } catch (e) {
                util.log(
                    "error",
                    "Modal handler attachment failed with: " +
                        e.message
                );
            }
        };
        
        // remove an event handler from modal
        Modal.prototype.off = function (event, handler) {
            try {
                events.unsubscribe(
                    this.eventName[event],
                    handler
                );
            } catch (e) {
                util.log(
                    "error",
                    "Modal handler removal failed with: " +
                        e.message
                );
            }
        };
        
        // trigger a modal event with data
        Modal.prototype.trigger = function (event, data) {
            events.publish("gui/modal/" + event, data);
            events.publish(this.eventName[event], data);
        };
        
        // hide modal
        Modal.prototype.hide = function () {
            this.node.hide();
        };
        
        // show modal
        Modal.prototype.show = function () {
            this.node.show();
        };
        
        // handler/listener application for modal
        Modal.prototype.applyHandlers = function () {
            var
                // instance ref
                self = this,
            
                // error handler
                err = function (event) {
                    // warning
                    util.log(
                        "warn",
                        "Modal '" + self.viewName + "' " +
                            "event '" + event + "' " +
                            "ran but didn't have a handler!"
                    );
                },
                
                // modal params
                params = this.params;
            
            // when shield is clicked - swap stack
            this.shieldNode.on("click", function () {
                ctrl.swapStack(self.viewName);
            });

            // attach modal event handlers
            this.on("confirm", params.confirm || function () {
                err("confirm");
            });
            
            this.on("cancel", params.cancel || function () {
                err("cancel");
            });

            this.on("proceed", params.proceed || function () {
                err("proceed");
            });
        };
        
        // init modal
        Modal.prototype.rInit = function () {
            if (this.inited) {
                // skip build and open
                this.open();
                return this;
            }
            
            // declarations
            var modal = this.node,
                self = this,
                title = modal.createChild(
                    "h2",
                    "kbs-modal-title"
                ),
                close = modal.createChild(
                    "i",
                    "fa fa-times kbs-modal-closed"
                ),
                content = modal.createChild(
                    "p",
                    "kbs-modal-content"
                );
            
            // set content and append to gui
            title.text(this.title);
            close.on("click", function () {
                // signal the stack processor that we
                // shouldn't be captured
                self.dueRemoval = true;
                self.close();
            });
            content.addChild(this.view);
            gui.addChild(modal);
            
            // flag inited
            this.inited = true;
            
            // publish
            this.trigger("init", this);
            
            // open
            this.open();
        };
        
        // opens the modal
        Modal.prototype.rOpen = function () {
            // if we are already open - return
            if (ctrl.isActive(this)) {
                return;
            }
            
            // make sure we have inited
            if (!this.inited) {
                return this.init();
            }
            
            // reset due removal flag
            this.dueRemoval = false;
            
            // show overlay and node
            gui.showOverlay();
            this.node.fadeIn();
            
            // publish
            this.trigger("open", this);
            
            ctrl.active = this;
            
            return this;
        };
        
        // closes the modal
        Modal.prototype.rClose = function () {
            this.node.hide();
            
            // remove from controller opened modals
            ctrl.removeFromOpened(this);
            
            // publish
            this.trigger("close", this);
        };
        
        // destroys a modal instance
        Modal.prototype.rDestroy = function () {
            // close if open
            if (ctrl.isOpen(this)) {
                this.rClose();
            }
            
            // reset flags
            this.inited = false;
            this.loaded = false;
            
            // remove from ctrl modal array
            ctrl.removeModal(this);
            
            // publish
            this.trigger("destruct", this);
            
            // destroy node
            this.node.destroy();
        };
        
        // set gui instance
        Modal.prototype.setInstance = function (instance) {
            gui = instance;
        };
        
        // get controller instance
        Modal.prototype.getController = function () {
            return ctrl;
        };
        
        return Modal;
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
        

        var self, modded = {};
        
        // configurator class
        function Configurator() {
            // don't need multiple instances
            if (self) {
                return self;
            }
            
            self = this;
            this.modal = null;
            this.launchModal = this.rLaunchModal.bind(this);
            this.reloadModal = this.rReloadModal.bind(this);
        }
        
        // get user config object from cookie
        Configurator.prototype.getUserData = function () {
            var cookie = util.cookie.get("settings"),
                data = util.unserialise(cookie);
            
            return data || {};
        };
        
        // get user config object string
        Configurator.prototype.getUserCookie = function () {
            return util.cookie.get("settings");
        };
        
        // get formatted user config object string
        Configurator.prototype.getFormattedUserCookie = function () {
            return JSON.stringify(modded, null, 4);
        };
        
        // check for and load existing user config data
        Configurator.prototype.loadExisting = function () {
            var data = this.getUserData(),
                parsed;
            
            if (data) {
                util.log("loading existing user config");
                modded = data;
                util.merge(config, data, true);
                return;
            } else {
                util.log("error", "no user data found!");
            }
        };
        
        // return list of modified properties
        Configurator.prototype.modifiedProperties = function () {
            var list = [],
                prop;
            
            // form an array of prop names
            for (prop in modded) {
                if (modded.hasOwnProperty(prop)) {
                    list.push(prop);
                }
            }
            
            return list;
        };
        
        // launch the configurator ui
        Configurator.prototype.rLaunchModal = function () {
            // initialise the modal
            if (this.modal) {
                this.modal.init();
            } else {
                this.modal = new Modal("user-config", {init: true});
            }
        };
        
        // reload the configurator ui
        Configurator.prototype.rReloadModal = function () {
            if (this.modal) {
                this.modal.reload();
            }
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
        Configurator.prototype.set = function (selector, value, reload) {
            var segments = selector.split("/"),
                len = segments.length,
                got = config,
                i = 0,
                tree = modded,
                parent,
                parentName;
            
            reload = reload || false;

            // if a simple selector
            if (len === 1) {
                // update config
                config[selector] = value;
                
                // update mofified prop list
                modded[selector] = value;
                
                // update user prefs cookie
                util.cookie.set(
                    "settings",
                    util.serialise(modded)
                );
                
                // reload the modal
                if (reload) {
                    this.modal.reload(true);
                }
                
                return config[selector];
            }

            // more complex selector build tree to
            // target value and get reference to parent
            // config object
            for (i; i < len; i += 1) {
                // if second to last segment, set as parent ref
                if (i === len - 2) {
                    parent = got[segments[i]];
                    parentName = segments[i];
                }
                
                // set ref for next loop
                got = got[segments[i]];
                
                // build tree for merging with config
                if (i !== len - 1) {
                    tree[segments[i]] = tree[segments[i]] || {};
                    tree = tree[segments[i]];
                } else {
                    tree[segments[i]] = value;
                }
            }

            // set values in config, modified
            // prop list and user cookie
            
            // set value to config config
            parent[segments[len - 1]] = value;
            
            // update user prefs cookie
            util.cookie.set(
                "settings",
                util.serialise(modded)
            );
            
            // reload the modal
            if (reload) {
                this.modal.reload(true);
            }
            
            return parent[segments[len - 1]];
        };

        // reset config to default state
        Configurator.prototype.reset = function () {
            // reset config object
            config.reset();
            
            // delete user settings cookie
            util.cookie.del("settings");
            
            // refresh page
            location.hash = "settings";
            location.reload();
        };

        return Configurator;
    }
);

/*
*   @type javascript
*   @name bugherd.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

/*jslint nomen: true*/

define(
    'main/components/bugherd',[
        'config',
        'main/components/util',
        'main/components/cache',
        'main/components/status',
        'main/components/repository',
        'main/ui/node'
    ],
    function (config, util, cache, status, Repository, Node) {
        
        
        // bugherd's global api
        var repo = new Repository(),
            bh = window.bugherd,
            $ = window.jQuery,
            interactor,
            instance,
            gui;
        
        /* Class Definitions
        ------------------------------------------*/
        // task api controller
        function TaskController() {
            this.api = bh.application.tasksCollection;
            this.baseApi = instance;
            this.setSeverityStyle = this.rSetSeverityStyle.bind(this);
            this.setAllSeverityStyles = this.rSetAllSeverityStyles.bind(this);
        }
        
        // bugherd api wrapper
        function BugHerd() {
            // return the instance if already exists
            if (instance) {
                return instance;
            }
            
            // set instances
            instance = this;
            interactor = interactor || repo.get("interactor");
            gui = gui || repo.get("gui");
            
            this.api = bh;
            this.tasks = new TaskController();
            this.init();
        }
        
        /* TaskController Prototype
        ------------------------------------------*/
        TaskController.prototype.init = function () {
            var self = this;
            
            // setup task event listeners
            this.applyHandlers();
            
            // severity styling handling
            if (config.gui.severityStyles) {
                setTimeout(function () {
                    self.setAllSeverityStyles();
                }, 100);
                bh.application.on("change", function () {
                    setTimeout(self.setAllSeverityStyles, 100);
                });
            }
        };
        
        // get task data by local id
        TaskController.prototype.findModelByLocalId = function (id) {
            var tasks = this.baseApi.tasks(),
                len = tasks.length,
                i = 0;
            
            // loop through and check the local_task_id attribute
            for (i; i < len; i += 1) {
                if (tasks[i].attributes.local_task_id === id) {
                    return tasks[i];
                }
            }
        };
        
        // get task data by global id
        TaskController.prototype.findModelByGlobalId = function (id) {
            var tasks = this.baseApi.tasks(),
                len = tasks.length,
                i = 0;
            
            // loop through and check the global id
            for (i; i < len; i += 1) {
                if (tasks[i].id === id) {
                    return tasks[i];
                }
            }
        };
        
        // gets the browser info from a task
        TaskController.prototype.getBrowserInfo = function (task, key) {
            // catch invalid task types
            if (!util.isObject(task) && !util.isNumber(task)) {
                util.log("error", "Unable to get task from parameter of type " +
                        typeof task);
            }
            
            // passed an id
            if (util.isNumber(task)) {
                // passed a global id
                if (task > 1000000) {
                    task = this.findModelByGlobalId(task);
                } else {
                    // passed a local id
                    task = this.findModelByLocalId(task);
                }
            }
            
            return task.attributes.browser_info[key] ||
                task.attributes.browser_info;
        };
        
        // gets the user meta data from a task
        TaskController.prototype.getMeta = function (task) {
            // passed an id
            if (util.isNumber(task)) {
                // passed a global id
                if (task > 1000000) {
                    task = this.findModelByGlobalId(task);
                } else {
                    // passed a local id
                    task = this.findModelByLocalId(task);
                }
            }
            
            return task.attributes.data.userMetaData;
        };
        
        // gets an array of tasks with specified meta data
        TaskController.prototype.findAllWithMeta = function (attr, value) {
            return this.match(function (task) {
                var meta = task.getData().userMetaData || {};
                
                // capture tasks without meta
                if (!util.isDefined(meta[attr])) {
                    return false;
                }
                
                return (
                    meta[attr] === value ||
                    util.contains(meta[attr], value)
                ) ? true : false;
            });
        };
        
        // gets an array of tasks with specified attribute
        TaskController.prototype.findAllWithAttribute = function (attr, value) {
            return this.match(function (task) {
                var attrs = task.attributes;
                
                return (
                    attrs[attr] === value ||
                    util.contains(attrs[attr], value)
                ) ? true : false;
            });
        };
        
        // gets an array of tasks with specified browser data
        TaskController.prototype.findAllWithClientData = function (attr, value) {
            return this.match(function (task) {
                var data = task.getBrowserData() || {};
                
                // capture tasks without client data
                if (!util.isDefined(data[attr])) {
                    return false;
                }
                
                return (
                    data[attr] === value ||
                    util.contains(data[attr], value)
                ) ? true : false;
            });
        };
        
        // retrieves tasks that have a certain tag
        TaskController.prototype.findAllWithTag = function (tag) {
            return this.match(function (task) {
                var tags = task.attributes.tag_names;
                return (util.contains(tags, tag)) ? true : false;
            });
        };
        
        TaskController.prototype.match = function (matched) {
            var tasks = this.api.models,
                len = tasks.length,
                results = [],
                i = 0,
                task;
            
            // check meta of tasks
            for (i; i < len; i += 1) {
                task = tasks[i];
                if (matched(task)) {
                    results.push(task);
                }
            }
            
            return results;
        };
        
        // apply event handlers
        TaskController.prototype.applyHandlers = function () {
            // event logger
            var
                self = this,
                bh = this.baseApi,
                
                // event logging
                eventLog = function (task, type, msg) {
                    // pull attributes
                    var user = task.attributes.requester_name,
                        id = task.attributes.local_task_id,
                        
                        // status
                        prevStatusId = task._previousAttributes.status_id,
                        statusId = task.attributes.status_id,
                        prevStatus = bh.getStatusFromId(prevStatusId),
                        status = bh.getStatusFromId(statusId),
                        
                        // severity
                        severityId = task.attributes.priority_id,
                        severity = bh.getPriorityFromId(severityId),
                        
                        message;

                    // format message with values
                    message = msg.replace("${user}", user);
                    message = message.replace("${id}", id);
                    message = message.replace("${prevStatus}", prevStatus);
                    message = message.replace("${status}", status);
                    message = message.replace("${severity}", severity);
                    
                    util.log(
                        "context:bugherd",
                        type,
                        task,
                        message
                    );

                    // set the recent task
                    cache.RECENT_TASK = task;
                };
            
            // task creation
            this.on("add", function (event) {
                eventLog(
                    event,
                    "okay",
                    "Task '#${id}' created by '${user}'"
                );
                
                self.setAllSeverityStyles();
            });
            
            // task deletion
            this.on("remove", function (event) {
                eventLog(
                    event,
                    "warn",
                    "Task '#${id}' was deleted"
                );
                
                // if task is expanded
                if (status.interactor.taskDetailsExpanded) {
                    // task is deleted task
                    if (parseInt(interactor.activeTask, 10) === event.attributes.local_task_id) {
                        interactor.closeTask();
                    }
                }
                
                self.setAllSeverityStyles();
            });
            
            // on task refresh
            this.on("refresh", function (event) {
                eventLog(
                    event,
                    "info",
                    "Task '#${id}' refreshed"
                );
                
                self.setAllSeverityStyles();
            });
            
            // task status updates
            this.on("change:status_id", function (event) {
                eventLog(
                    event,
                    "info",
                    "Task '#${id}' moved from " +
                        "'${prevStatus}' to '${status}'"
                );
                
                self.setAllSeverityStyles();
            });
            
            // task severity updates
            this.on("change:priority_id", function (event) {
                eventLog(
                    event,
                    "info",
                    "Task '#${id}' set to '${severity}'"
                );
                
                self.setAllSeverityStyles();
            });
        };
        
        // apply a handler to a bugherd task event
        TaskController.prototype.on = function (event, handler) {
            this.api.on(event, handler);
        };
        
        // apply a tasks severity style to its body
        TaskController.prototype.rSetSeverityStyle = function (task) {
            var severity;
            
            // create or retrieve a new Node instance for task
            task = new Node(document.querySelector("#task_" + task));
            severity = task.find(".task-severity");
            
            if (severity.length) {
                severity = severity[0]
                    .element
                    .className
                    .replace("task-severity", "")
                    .replace(/\s/g, "");

                task.addClass(severity);
            }
        };
        
        // apply severity styles to all tasks
        TaskController.prototype.rSetAllSeverityStyles = function () {
            var tasks = document.querySelectorAll(".task"),
                len = tasks.length,
                i = 0,
                id;
            
            for (i; i < len; i += 1) {
                id = tasks[i].id.replace("task_", "");
                
                if (id) {
                    this.setSeverityStyle(id);
                }
            }
        };
        
        /* BugHerd Prototype
        ------------------------------------------*/
        // init the bugherd api wrapper
        BugHerd.prototype.init = function () {
            this.tasks.init();
            this.applyContext();
            this.applyHandlers();
        };
        
        // apply handlers/listeners
        BugHerd.prototype.applyHandlers = function () {};
        
        // apply bugherd api logging context
        BugHerd.prototype.applyContext = function () {
            util.log(
                "context:bugherd",
                "buffer",
                "log-buffer: BUGHERD-API"
            );
        };
        
        // apply a handler to bugherd taskCollection event
        BugHerd.prototype.on = function (event, handler) {
            bh.application.on(event, handler);
        };
        
        // trigger a bugherd application event
        BugHerd.prototype.trigger = function (event) {
            bh.application.trigger(event);
        };
        
        // returns status name from id
        BugHerd.prototype.getStatusFromId = function (id) {
            var status,
                map = {
                    "null": "feedback",
                    "0": "backlog",
                    "1": "todo",
                    "2": "doing",
                    // obviously 3 was set free
                    "4": "done",
                    "5": "archive"
                };
            
            return map[id];
        };
        
        // returns priority/severity name from id
        BugHerd.prototype.getPriorityFromId = function (id) {
            var priority,
                map = {
                    "0": "not set",
                    "1": "critical",
                    "2": "important",
                    "3": "normal",
                    "4": "minor"
                };
            
            return map[id];
        };
        
        // returns all tasks for the current project
        BugHerd.prototype.getTasks = function () {
            return bh.application.tasksCollection.models;
        };
        
        return BugHerd;
    }
);
/*
*   @type javascript
*   @name router.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define('main/components/router',['config'], function (config) {
    
    
    // configured routes
    var
        routes = {
            "console/save": config.routes.console.save
        },
        url = window.KBS_BASE_URL;
    
    return {
        // return a route to a component controller
        getRoute: function (component, fn) {
            if (typeof fn === "undefined") {
                return url + routes[component];
            }
            
            return url + config.routes[component][fn];
        }
    };
});
/*
*   @type javascript
*   @name console.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

/*
*   TODO:
*   + Possibly find a way to optimise the gui logs to use text appending
*     instead of using new nodes for each log. Big performance hit when
*     using the GUI console.
*/

define(
    'main/ui/console',[
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
        'main/components/status',
        'main/components/counter',
        'main/components/configurator',
        'main/ui/node',
        'main/ui/console',
        'main/ui/modal'
    ],
    function (
        config,
        util,
        events,
        status,
        Counter,
        Configurator,
        Node,
        Console,
        Modal
    ) {
        

        // instance pointer
        var self,
            configurator = new Configurator();

        util.log("+ gui.js loaded");

        // gui constructor
        function GUI() {
            // set pointer
            self = this;

            // pass our instance to Modal closure
            Modal.prototype.setInstance(this);
            
            // setup logging context
            this.applyContext();
            
            // modals api
            this.setModalApi();
            
            // tree and console
            this.tree = this.buildNodeTree();
            this.console = new Console(this);
            
            // overlay preservation flag
            this.preserveOverlay = false;

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
                    events.publish("kbs/gui/loaded");
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
                    
                    // attach wallpaper
                    self.loadWallpaper();

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
                events.subscribe("kbs/gui/loaded", publish);
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
            
        // apply gui logging context
        GUI.prototype.applyContext = function () {
            // have to wait for gui loaded
            events.subscribe("kbs/gui/loaded", function () {
                util.log(
                    "context:gui",
                    "buffer",
                    "log-buffer: GUI"
                );
            });
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
            
            // update config
            configurator.set("theme", theme);
        };
            
        // remove current theme
        GUI.prototype.unloadTheme = function () {
            var themelink = document.getElementById("kbs-theme-link"),
                node = new Node(themelink);
            
            node.attr("href", "");
        };
            
        // load wallpaper
        GUI.prototype.loadWallpaper = function (url) {
            var el = new Node(document.getElementById("kanbanBoard"));
            
            url = url || config.gui.wallpaper;
            url = "url('" + url + "')";
            
            el.css("background-image", url);
        };
            
        // show overlay
        GUI.prototype.showOverlay = function () {
            if (!status.gui.overlay) {
                self.tree.main.overlay.fadeIn();
                status.gui.overlay = true;
            }
        };
            
        // hide overlay
        GUI.prototype.hideOverlay = function () {
            if (!status.interactor.taskDetailsExpanded && !self.preserveOverlay) {
                self.tree.main.overlay.fadeOut();
                status.gui.overlay = false;
            }
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
                    if (!current.hasClass("kbs-log-closed")) {
                        // we need to close the block
                        current.addClass("kbs-log-closed");
                    } else {
                        // we need to open the block
                        current.removeClass("kbs-log-closed");
                    }
                }
            };
        };
            
        // modal api / dynamic properties
        GUI.prototype.setModalApi = function () {
            this.modals = Modal.prototype.getController();
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
*   @type javascript
*   @name interactor.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true, MutationObserver: true */

define(
    'main/ui/interactor',[
        'config',
        'main/components/util',
        'main/components/events',
        'main/components/status',
        'main/components/repository',
        'main/components/configurator',
        'main/ui/node',
        'main/ui/modal'
    ],
    function (
        config,
        util,
        events,
        status,
        Repository,
        Configurator,
        Node,
        Modal
    ) {
        

        // declarations
        var $,
            self,
            inited = false,
            configurator = new Configurator(),
            repo = new Repository(),
            bugherd,
            gui;

        // interactor constructor
        function Interactor() {
            util.log(
                "context:inter/init",
                "info",
                "Initialising Interactor..."
            );
            
            // set references
            self = this;
            gui = repo.get("gui");
            
            this.activeTask = null;
            
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

        // expand the currently active task or a specified task id
        Interactor.prototype.openTask = function (localId) {
            util.log(
                "context:interactor",
                "Opening task #" + localId + "..."
            );
            
            this.activeTask = localId;
            
            if (typeof localId === "undefined") {
                this.expandTaskDetails();
                return;
            }
            
            // get global id
            this.findGlobalId(localId, function (task) {
                // once found - click the task
                setTimeout(function () {
                    task.trigger("click");
                }, 500);
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
            
            this.activeTask = this.findLocalIdFromDetails();
            util.log("context:interactor", "active task: #" + this.activeTask);
            
            // show overlay
            $(".kbs-overlay").show();
            
            // add expansion class
            $(".taskDetails").hide().addClass("kbs-details-expand");
            
            // show elements
            setTimeout(function () {
                $(".taskDetails, .kbs-details-closed").fadeIn();
            
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
                btn = $(".kbs-details-closed");
            
            if (!status.interactor.taskDetailsExpanded) {
                return;
            }
            
            this.activeTask = null;
            
            // set status
            status.interactor.taskDetailsExpanded = false;
            
            // hide elements
            task.removeClass("kbs-details-expand");
            btn.fadeOut();
            gui.hideOverlay();
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
            facet.val(localId)
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
                        document.activeElement.blur();
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
                        
                        errModal = new Modal("task-not-found", {
                            init: true,
                            id: localId,
                            confirm: function () {
                                // close the err modal
                                errModal.close();
                                
                                // re-open search task
                                errModal
                                    .getController()
                                    .getModalByName("task-search")
                                    .open();
                            },
                            cancel: function () {
                                errModal.close();
                            }
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
            return $("#task_" + globalId).find(".task-id, .taskID").text();
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
            
        // find a local task id from task details
        Interactor.prototype.findLocalIdFromDetails = function () {
            var parent = $(".taskDetails"),
                localId = parent.find(".local_task_id");
            
            return localId.text() || localId.val();
        };
        
        // get the task element from an inner component
        // note: only applies to board tasks
        Interactor.prototype.findTaskFromComponent = function (component) {
            var task = component.closest("[id^=task_]");
            
            // if not found - return false
            if (!task.length) {
                return false;
            }
            
            return this.findLocalIdFromTask(task);
        };
            
        // navigate the ui to a specified task board
        Interactor.prototype.navigateTo = function (board) {
            var nav = $("#nav-" + board.toLowerCase());
            
            // make sure is valid view
            if (nav.length) {
                nav.trigger("click");
            } else {
                util.log(
                    "context:interactor",
                    "error",
                    "Failed to navigate to: '" + board + "'"
                );
            }
        };
            
        // view a screenshot in a modal
        Interactor.prototype.viewScreenshot = function (link) {
            var bugherd = repo.get("bugherd"),
                size = {},
                winsize,
                modal,
                id;
            
            // get the task id from detail panel
            id = parseInt(self.findLocalIdFromDetails(), 10);
            
            util.log(
                "context:interactor",
                "debug",
                "Viewing screenshot for task #" + id
            );
            
            modal = new Modal("view-screenshot", {
                viewParams: {
                    id: id,
                    title: (link[0]
                            .textContent
                            .indexOf("screenshot") !== -1
                           ) ? "Screenshot" : "Fix Result",
                    url: link[0].href,
                    width: size.x,
                    height: size.y
                }
            });
        };
            
        // perform action on tasks with tag
        Interactor.prototype.onTasksWithTag = function (method, tag) {
            var bugherd = repo.get("bugherd"),
                tasks = bugherd.getTasks(),
                list = bugherd.tasks.findAllWithTag(tag),
                len = list.length,
                i = 0,
                x = 0,
                disp = (method === "show") ? "block" : "none",
                e;
            
            // return list of tasks with tag
            if (method === "list") {
                // return task id's
                for (x; x < len; x += 1) {
                    list[x] = list[x].attributes.local_task_id;
                }
                
                return new Modal("view-object", {
                    viewParams: {
                        message: list.length + " items:",
                        object: list.sort()
                    }
                });
            }
            
            for (i; i < len; i += 1) {
                e = document.getElementById("task_" + list[i].id);
                
                if (e) {
                    e.style.display = disp;
                }
            }
        };
            
        // perform action on tasks with attributes
        Interactor.prototype.onTasksWithAttribute = function (method, key, value) {
            var bugherd = repo.get("bugherd"),
                list = bugherd.tasks.findAllWithAttribute(key, value),
                len = list.length,
                i = 0,
                x = 0,
                disp = (method === "show") ? "block" : "none",
                e;
            
            // return list of tasks with data
            if (method === "list") {
                // return task id's
                for (x; x < len; x += 1) {
                    list[x] = list[x].attributes.local_task_id;
                }
                
                return new Modal("view-object", {
                    viewParams: {
                        message: list.length + " items:",
                        object: list.sort()
                    }
                });
            }
            
            for (i; i < len; i += 1) {
                e = document.getElementById("task_" + list[i].id);
                
                if (e) {
                    e.style.display = disp;
                }
            }
        };
            
        // perform action on tasks with client data
        Interactor.prototype.onTasksWithClientData = function (method, key, value) {
            // check for attribute flag - pass to attribute fn
            if (key.indexOf("[attr]") !== -1) {
                return this.onTasksWithAttribute(method, key.replace("[attr]", ""), value);
            }
            
            var bugherd = repo.get("bugherd"),
                list = bugherd.tasks.findAllWithClientData(key, value),
                len = list.length,
                i = 0,
                x = 0,
                disp = (method === "show") ? "block" : "none",
                e;
            
            // return list of tasks with data
            if (method === "list") {
                // return task id's
                for (x; x < len; x += 1) {
                    list[x] = list[x].attributes.local_task_id;
                }
                
                return new Modal("view-object", {
                    viewParams: {
                        message: list.length + " items:",
                        object: list.sort()
                    }
                });
            }
            
            for (i; i < len; i += 1) {
                e = document.getElementById("task_" + list[i].id);
                
                if (e) {
                    e.style.display = disp;
                }
            }
        };
            
        // perform action on tasks with meta data
        Interactor.prototype.onTasksWithMetaData = function (method, key, value) {
            var bugherd = repo.get("bugherd"),
                list = bugherd.tasks.findAllWithMeta(key, value),
                len = list.length,
                i = 0,
                x = 0,
                disp = (method === "show") ? "block" : "none",
                e;
            
            // return list of tasks with data
            if (method === "list") {
                // return task id's
                for (x; x < list.length; x += 1) {
                    list[x] = list[x].attributes.local_task_id;
                }
                
                return new Modal("view-object", {
                    viewParams: {
                        message: list.length + " items:",
                        object: list.sort()
                    }
                });
            }
            
            for (i; i < len; i += 1) {
                e = document.getElementById("task_" + list[i].id);
                
                if (e) {
                    e.style.display = disp;
                }
            }
        };
            
        // hides all tasks
        Interactor.prototype.hideAllTasks = function () {
            var bugherd = repo.get("bugherd"),
                tasks = bugherd.getTasks(),
                len = tasks.length,
                i = 0,
                e;
            
            // hide all tasks
            for (i; i < len; i += 1) {
                e = document.getElementById("task_" + tasks[i].id);
                
                if (e) {
                    e.style.display = "none";
                }
            }
        };
        
        // shows all tasks
        Interactor.prototype.showAllTasks = function () {
            var bugherd = repo.get("bugherd"),
                tasks = bugherd.getTasks(),
                len = tasks.length,
                i = 0,
                e;
            
            // hide all tasks
            for (i; i < len; i += 1) {
                e = document.getElementById("task_" + tasks[i].id);
                
                if (e) {
                    e.style.display = "block";
                }
            }
        };
            
        // reset any task filters
        Interactor.prototype.resetAllFilters = function () {
            this.showAllTasks();
            $("div.head-actions:nth-child(1) > " +
                "ul:nth-child(1) > li:nth-child(1) > " +
                "ul:nth-child(3) > li:nth-child(1) > " +
                "a:nth-child(1)").trigger("click");
            
            this.showAllTasks();
        };
        
        // return current hash
        Interactor.prototype.getHash = function () {
            return window.location.hash;
        };
            
        // apply hash command
        Interactor.prototype.parseHash = function () {
            var hash = this.getHash(),
                href = window.location.href,
                taskId;
            
            util.log(
                "context:hash",
                "parsing new hash: " + hash
            );

            // open task
            if (hash === "#open") {
                // get task id
                if (href.indexOf("tasks/") !== -1) {
                    taskId = parseInt(href.split("tasks/")[1], 10);
                } else {
                    taskId = parseInt(hash.replace("#open", ""), 10);
                }
            }
            
            // settings
            if (hash === "#settings") {
                configurator.launchModal();
                location.hash = "";
            }

            if (taskId) {
                this.openTask(taskId);
            }
        };

        // append elements to bugherd ui
        Interactor.prototype.applyElements = function () {
            // declarations
            var search,
                filter,
                detailClose,
                taskSearch,
                taskFilter,
                nav;
            
            util.log(
                "context:inter/init",
                "+ appending elements to bugherd"
            );

            // task search list element
            search = new Node("li");
            
            // task search anchor element
            search.createChild("a")
                .text("Search Task")
                .on("click", function (event) {
                    taskSearch = new Modal("task-search", {
                        proceed: function (localId) {
                            if (!localId) {
                                // return if no id passed
                                return;
                            }
                            
                            taskSearch.close();
                            self.openTask(localId);
                        }
                    });
                });
            
           // task filter list element
            filter = new Node("li");
            
            // task filter anchor element
            filter.createChild("a")
                .text("Filter")
                .on("click", function (event) {
                    taskFilter = new Modal("task-filter");
                });
            
            // task details close button
            detailClose = new Node("div", "kbs-details-closed");
            detailClose.createChild("i", "fa fa-times");
            detailClose.on("click", function (event) {
                self.closeTask();
            });
            
            // write
            nav = $(".nav.main-nav")[0];
            search.writeTo(nav);
            filter.writeTo(nav);
            detailClose.writeTo($("body")[0]);
        };
            
        // apply event handlers
        Interactor.prototype.applyHandlers = function () {
            var appwrap = new Node(".app-wrap"),
                body = new Node(document.body),
                kanban = new Node("#kanbanBoard"),
                move,
                frame,
                fc;
            
            util.log(
                "context:inter/init",
                "+ applying handlers to bugherd"
            );
            
            // delegate clicks on app wrapper
            appwrap.on("click", function (event) {
                var target = $(event.target),
                    task = self.isTask(target);
                
                // capture task clicks
                if (task && config.interactor.expandOnclick) {
                    self.expandTaskDetails();
                    return;
                }
                
                // capture screenshot clicks
                if (target.hasClass("attachLink")) {
                    // view screenshots only
                    if (target.text().match(/(fix-result)|(view_screenshot)|(\.png)|(\.jpg)/)) {
                        event.preventDefault();
                        self.viewScreenshot(target);
                    }
                }
            });
            
            // on document mouse move - apply parallax to wallpaper
            // if there is one (experimental)
            if (config.gui.wallpaper && config.gui.parallax.enabled) {
                move = false;
                frame = setInterval(function () {
                    move = (move) ? false : true;
                }, 32);
                
                body.on("mousemove", function (event) {
                    fc = config.gui.parallax.factor;
                    
                    if (move) {
                        var deltaX = -(event.pageX / fc),
                            deltaY = -(event.pageY / fc);

                        kanban.css(
                            "background-position",
                            deltaX + "px " + deltaY + "px"
                        );
                    }
                });
            }
        };

        // apply new styling to bugherd ui
        Interactor.prototype.applyStyles = function () {
            util.log(
                "context:inter/init",
                "+ applying styles to bugherd"
            );
            
            // apply wallpaper
            $(".pane-center .pane-content").css("background-image", config.gui.wallpaper);

            // add a margin to user nav to accompany console controls
            $(".nav.user-menu").css("margin-right", "10px");
            
            // overhaul theme specifics
            if (gui.getThemeName().indexOf("DOS") !== -1) {
                // change VS search icon to use fa
                $(".VS-icon-search").append("<i class=\"fa fa-search\"></i>");
                $(".VS-icon-search").css("top", "8px");

                // change VS cancel icon to use fa
                $(".VS-icon-cancel").append("<i class=\"fa fa-times\"></i>");
                $(".VS-icon-cancel").css("top", "8px");
            }
        };
            
        // apply interactor logging context / output
        Interactor.prototype.applyContext = function () {
            util.log(
                "context:inter/init",
                "+ applying interactor context"
            );
            util.log(
                "context:interactor",
                "buffer",
                "log-buffer: INTERACTOR"
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
            
            util.log("context:hash", "buffer", "log-buffer: HASH");
            
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
            require([window.KBS_BASE_URL + "src/test/" + test + ".test.js"]);
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
*   + Add a comments interface/modal (with a spellchecker? Preview post?)
*
*   + Monitor status of all components and defer kbs/loaded event until
*     all components have finished initialising, more reliable than hard coding
*     the event fire (maybe combine with the repository component?)
*
*   + Possibly add more info about the task to expanded details? Such as
*     the last updated at and update by etc?
*
*   + Might want to add max length parameters for the console.
*     Maybe as a config option?
*
*   + Add a badge to tasks with comments? Is there a way to show when new
*     comments arrive?
*/

/*
*   PROJECTS & PRACTICE
*   + Re-write the issue reporter and possibly move away from BugHerd
*     exclusivity, allowing interfaces between other parties
*
*   + Write a game in JavaScript
*
*   + Template loading system - parse shorthand templates to full HTML
*     page.
*
*   + Separate the gui logging console from Kanban and make it a separate
*     project. Expand upon it there.
*/

define(
    'main/init',[
        'config',
        'main/components/util',
        'main/components/events',
        'main/components/status',
        'main/components/cache',
        'main/components/exception',
        'main/components/repository',
        'main/components/http',
        'main/components/configurator',
        'main/components/bugherd',
        'main/ui/node',
        'main/ui/gui',
        'main/ui/modal',
        'main/ui/interactor',
        'test/main.test'
    ],
    function KanbanInitialise(
        config,
        util,
        events,
        status,
        cache,
        Exception,
        Repository,
        Http,
        Configurator,
        BugHerd,
        Node,
        GUI,
        Modal,
        Interactor,
        tests
    ) {
        

        // components
        var kanban, end, gui, interactor,
            ehandle, settings, bugherd,
            repo = new Repository();
            
        /* end of init call
        ------------------------------------------------------*/
        end = function () {
            // get performance delta
            window.KBS_DELTA_TIME =
                (new Date().getTime() - window.KBS_START_TIME) + "ms";

            // log
            util.log(
                "okay",
                "Kanban initialised in " +
                    window.KBS_DELTA_TIME +
                    ". Approx. size: " + util.bytesFormat(util.sizeof(kanban))
            );

            // expose the api if in dev mode
            if (config.mode === "dev") {
                window[config.appName] = kanban;
                window[config.appName + "_REPO"] = repo;
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
            
        /* initialise
        ------------------------------------------------------*/
        // wait for kbs loaded event
        events.subscribe("kbs/loaded", end);

        // subscribe to status updates
        events.subscribe("kbs/status", function (data) {
            status[data.component] = data.status;
        });
            
        // get a new configurator and load data
        try {
            settings = new Configurator();
            settings.loadExisting();
            repo.add("settings", settings);
        } catch (configuratorException) {
            ehandle = new Exception(
                configuratorException,
                "Configurator failed to initialise cleanly."
            );
        }

        // check if disabled
        if (!config.enabled) {
            return;
        }

        // initialise gui first so log buffer is constructed
        try {
            if (config.gui.enabled) {
                gui = new GUI();
                repo.add("gui", gui);
            }
        } catch (guiException) {
            ehandle = new Exception(
                guiException,
                "GUI failed to initialise cleanly."
            );
        }

        // initialise interactor
        try {
            if (config.interactor.enabled) {
                interactor = new Interactor();
                repo.add("interactor", interactor);
            }
        } catch (interactorException) {
            ehandle = new Exception(
                interactorException,
                "Interactor failed to initialise cleanly."
            );
        }
            
        // initialise the bugherd api wrapper
        try {
            bugherd = new BugHerd();
            repo.add("bugherd", bugherd);
        } catch (bugherdException) {
            ehandle = new Exception(
                bugherdException,
                "BugHerd API failed to initialise cleanly."
            );
        }

        // kbs data/api object
        kanban = {
            version: config.version,
            interactor: interactor,
            status: status,
            cache: cache,
            config: config,
            events: events,
            util: util,
            gui: gui,
            configurator: settings,
            Constructor: {
                "Configurator": Configurator,
                "Interactor": Interactor,
                "GUI": GUI,
                "BugHerd": BugHerd,
                "Http": Http,
                "Node": Node,
                "Modal": Modal,
                "Exception": Exception
            }
        };
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