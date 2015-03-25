/*
*   @type javascript
*   @name http.js
*   @copy Copyright 2015 Harry Phillips
*/

window.define(['./util'], function (util) {
    'use strict';
    
    function Http(url, callback, failback) {
        this.url = url;
        this.callback = callback;
        this.failback = failback;
    }
    
    Http.prototype.send = function () {
        var xml = new XMLHttpRequest();
        
        xml.onreadystatechange = function () {
            if (xml.readyState === 4) {
                if (xml.status === 200) {
                    this.callback();
                } else if (xml.status ===  400) {
                    this.failback();
                    util.log("error", "HTTP Error 400 on request to '" +
                             this.url + "'");
                } else {
                    util.log("warn", "HTTP Status Code: " + xml.status +
                            " was returned");
                }
            }
        };
    };
    
    return Http;
});