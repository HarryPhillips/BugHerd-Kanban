// ==UserScript==
// @name        Kanban
// @namespace   kanban
// @description Kanban Userscript
// @include     http://www.bugherd.com/*
// @include     https://www.bugherd.com/*
// @version     1
// @grant       none
// ==/UserScript==

var KBS_START_TIME = new Date().getTime(),
    KBS_END_TIME;

(function (window) {
	'use strict';

    // check for document body
    if (!window.document.body) {
        throw new Error("Could not find a document body!");
    }
    
    // declarations
    var
        // configuration urls
        baseUrl = "http://localhost/GitHub/",
        srcDir = "kanban/",
        reqUrl = "https://cdnjs.cloudflare.com/" +
        "ajax/libs/require.js/2.1.16/require.min.js",
        
        // document object
        document = window.document,
        
        // create node
        rqs = document.createElement("script");
    
    // set node props
    rqs.id = "kbs-require";
    rqs.type = "text/javascript";
    rqs.src = reqUrl;
    
    // set the custom data-main attribute
    rqs.setAttribute("data-main", baseUrl + srcDir + "kanban.js");
    
    // write out
    document.body.appendChild(rqs);
}(window));