// ==UserScript==
// @name        Kanban
// @namespace   Kanban
// @description BugHerd Kanban extensions and improvements
// @include     http://www.bugherd.com/*
// @include     https://www.bugherd.com/*
// @version     1.0.1
// @grant       none
// ==/UserScript==

(function (window) {
    'use strict';
    
    // declarations
    var
        // configuration urls
        reqUrl = "https://cdnjs.cloudflare.com/" +
        "ajax/libs/require.js/2.1.16/require.min.js",

        // document object
        document = window.document,

        // create node
        rqs = document.createElement("script"),
        test = document.createElement("div");

    // set node props
    rqs.id = "kbs-require";
    rqs.type = "text/javascript";
    rqs.src = reqUrl;

    // set the custom data-main attribute
    rqs.setAttribute(
        "data-main",
        "http://localhost/GitHub/Kanban/" +
            "kanban.js"
    );

    test.id = "kbs-window-test";
    
    // write out
    document.head.appendChild(rqs);
    document.body.appendChild(test);
}(window));