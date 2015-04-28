/*global prefUrl: true, prefSource: true */

(function (window) {
    'use strict';
    
    // declarations
    var
        // configuration urls
        baseUrl = prefUrl,
        reqUrl = "https://cdnjs.cloudflare.com/" +
        "ajax/libs/require.js/2.1.16/require.min.js",

        // document object
        document = window.document,
        
        // preference deposit
        deposit = document.createElement("div"),

        // create node
        rqs = document.createElement("script");

    // set node props
    rqs.id = "kbs-require";
    rqs.type = "text/javascript";
    rqs.src = reqUrl;

    // set the custom data-main attribute
    rqs.setAttribute(
        "data-main",
        prefUrl + prefSource
    );
    
    // set kbs globals deposit
    deposit.id = "kbs-deposit";
    deposit.className = [true, new Date().getTime(), "", prefUrl].join(" ");
    deposit.KBS_GLOBAL_SET = true;
    deposit.KBS_START_TIME = new Date().getTime();
    deposit.KBS_DELTA_TIME = "";
    deposit.KBS_BASE_URL = prefUrl;
    
    // write out
    document.body.appendChild(deposit);
    document.head.appendChild(rqs);
}(window));