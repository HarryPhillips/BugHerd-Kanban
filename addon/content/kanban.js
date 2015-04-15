// ==UserScript==
// @name        Kanban
// @namespace   Kanban
// @description BugHerd Kanban extensions and improvements
// @include     http://www.bugherd.com/*
// @include     https://www.bugherd.com/*
// @version     1.0.0
// @grant       none
// ==/UserScript==

(function (window) {
    'use strict';
    
    // set globals
    window.KBS_GLOBAL_SET = true;
    window.KBS_START_TIME = new Date().getTime();
    window.KBS_DELTA_TIME = "";
    window.KBS_SERVER = "http://localhost";
    window.KBS_BASE_URL = window.KBS_SERVER + "/GitHub/Kanban/";

    // check for document body
    if (!window.document.body) {
        throw new Error("Could not find a document body!");
    }
    
    // declarations
    var
        // configuration urls
        baseUrl = window.KBS_BASE_URL,
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
    rqs.setAttribute("data-main", baseUrl + "kanban.js");
    
    // write out
    document.head.appendChild(rqs);
}(window));
