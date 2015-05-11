/*
*   @type javascript
*   @name util.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    [
        'config',
        'main/components/events',
        'main/components/status',
        'main/components/cache'
    ],
    function (config, events, status, cache) {
        'use strict';

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
            if (
                typeof obj === "undefined" ||
                    instance.isArray(obj)
            ) {
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

        // serialise a data structure
        Util.prototype.serialise = function (object) {
            var index,
                result,
                length,
                props,
                separate = false;
            
            // this should capture simple types
            // e.g. strings and numbers
            result = object;
            
            // serialise object
            if (instance.isObject(object)) {
                result = "{";
                props = instance.listProperties(object);
                separate = true;
                
                // add each element to result string
                for (index in object) {
                    if (object.hasOwnProperty(index)) {
                        // add object value?
                        result += index + ": " +
                            instance.serialise(object[index]);
                        
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
            
            // serialise array
            if (instance.isArray(object)) {
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
                    
                    result += "'";
                    result += instance.serialise(object[index]);
                    result += "'";
                }
                     
                result += "]";
            }
            
            return result;
        };
        
        // return an array of properties on an object
        Util.prototype.listProperties = function (obj) {
            var list = [],
                index;
            
            if (!instance.isObject(obj)) {
                return;
            }
            
            for (index in obj) {
                if (obj.hasOwnProperty(index)) {
                    list.push(index);
                }
            }
            
            return list;
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
        
        // current logging context
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
