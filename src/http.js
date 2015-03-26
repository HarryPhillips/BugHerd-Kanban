/*
*   @type javascript
*   @name http.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(['./util', './counter'], function (util, Counter) {
    'use strict';
    
    // instance pointer
    var self;
    
    // construct a http request
    function Http(params) {
        // props
        this.url = params.url;
        this.method = params.method || "GET";
        this.async = params.async || true;
        this.data = JSON.stringify(params.data) || "nodata";
        
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
    
    // send request
    Http.prototype.send = function () {
        // new request
        var xml = new XMLHttpRequest();
        
        // open
        xml.open(this.method, this.url, this.async);
        
        xml.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200 && this.status < 400) {
                    // success
                    util.log("okay", "HTTP 200: " + this.url);
                    self.callbacks.success(this.responseText);
                } else {
                    // failure
                    util.log("error", "HTTP " + this.status + ": " + self.url);
                    self.callbacks.fail(this.responseText);
                }
            }
        };
        
        //xml.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        
        // send
        console.log(self.data);
        xml.send(self.data);
        
        // nullify
        xml = null;
    };
    
    return Http;
});