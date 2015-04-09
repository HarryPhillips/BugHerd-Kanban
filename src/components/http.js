/*
*   @type javascript
*   @name http.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    [
        'config',
        'src/util',
        './counter'
    ],
    function (config, util, Counter) {
        'use strict';

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