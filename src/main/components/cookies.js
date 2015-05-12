/*
*   @type javascript
*   @name cookies.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(['config'], function (config) {
    'use strict';
    
    // cookies class
    function Cookies() {}
    
    // get a cookie by name
    Cookies.prototype.get = function (name) {
        var cname = config.cookies.prefix + name + "=",
            cookies = document.cookie.split(';'),
            cookie,
            i;

        for (i = 0; i < cookies.length; i += 1) {
            cookie = cookies[i];

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