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
        'use strict';

        // util class
        function Util() {}
        
        // set instance for internal references
        var util = new Util(),
            instance;
        
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
            if (util.isArray(target)) {
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
            var i,
                exists;
            
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
            
            // default to json usage
            json = json || true;
            
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
                            result += index + ":" +
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
                        result += "'" + value + "'";
                    } else if (util.isNumber(value)) {
                        result += value;
                    } else {
                        result += util.serialise(value, json);
                    }
                }
                     
                result += "]";
            }
            
            // wrap string with '
            if (util.isString(object)) {
                return "'" + result + "'";
            }
            
            return result;
        };
        
        // unserialise a data structure
        Util.prototype.unserialise = function (string, json) {
            var result,
                parts,
                index,
                length,
                props;
            
            // default to json usage
            json = json || true;
            
            // parse an array from string
            function parseArray(str) {
                var result = [],
                    nstruct = new RegExp(/(\[)|(\{)/g),
                    estruct = new RegExp(/(\])|(\})/g),
                    instr = false,
                    strch,
                    value = "",
                    eov,
                    len,
                    ch,
                    pch,
                    depth = 0,
                    i = 0;
                
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
                        if (pch !== "\\" && ch === strch) {
                            if (instr && ch === strch) {
                                instr = false;
                                strch = "";
                            } else if (!instr) {
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
                    
                    // end of value flag
                    eov = ((ch === "," || estruct.test(ch))
                           && !depth
                           && !instr);
                    
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
                    // assume number if no quotes
                    str = Number(str);
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
        
        // create instance
        instance = new Util();
        util.log("+ util.js loaded");

        return instance;
    }
);
