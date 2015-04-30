/*
*   TODO:
*   + Remove unnecessary GM references
*/


/*jslint sloppy: true, regexp: true */

/*global
    Sandbox: true,
    Components: true,
    XPCNativeWrapper: true,
    KanbanHttpRequester: true,
    PrefManager: true,
    KanbanPref: true,
    content: true,
    unsafeContentWin: true,
    evalInSandbox: true,
    getBrowser: true,
    url: true,
    alert: true
*/

var KanbanLoader = {
    getUrlContents: function (aUrl) {
        var
            ioService =
            Components.classes["@mozilla.org/network/io-service;1"]
            .getService(Components.interfaces.nsIIOService),
            
            scriptableStream =
            Components.classes["@mozilla.org/scriptableinputstream;1"]
            .getService(Components.interfaces.nsIScriptableInputStream),
            
            unicodeConverter =
            Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
            .createInstance(Components.interfaces.nsIScriptableUnicodeConverter),
            
            channel,
            input,
            str;
        
        unicodeConverter.charset = "UTF-8";
        channel = ioService.newChannel(aUrl, "UTF-8", null);
        input = channel.open();
        scriptableStream.init(input);
        str = scriptableStream.read(input.available());
        scriptableStream.close();
        input.close();

        try {
            return unicodeConverter.ConvertToUnicode(str);
        } catch (e) {
            return str;
        }
    },

    isGreasemonkeyable: function (url) {
        var scheme = Components.classes["@mozilla.org/network/io-service;1"]
            .getService(Components.interfaces.nsIIOService)
            .extractScheme(url);
        
        return (
            (scheme === "http" || scheme === "https" || scheme === "file") &&
            !/hiddenWindow\.html$/.test(url)
        );
    },

    contentLoad: function (e) {
        var unsafeWin = e.target.defaultView,
            unsafeLoc,
            href,
            script;
        
        if (unsafeWin.wrappedJSObject) {
            unsafeWin = unsafeWin.wrappedJSObject;
        }

        unsafeLoc = new XPCNativeWrapper(unsafeWin, "location").location;
        href = new XPCNativeWrapper(unsafeLoc, "href").href;

        if (
            KanbanLoader.isGreasemonkeyable(href)
                && (/^http:\/\/www\.bugherd\.com\/.*$/i.test(href) || /^https:\/\/www\.bugherd\.com\/.*$/i.test(href))
                && true
        ) {
            script = KanbanLoader.getUrlContents(
                'chrome://kanban/content/append.js'
            );
            
            KanbanLoader.injectScript(script, href, unsafeWin);
        }
    },

    injectScript: function (script, url, unsafeContentWin) {
        var
            sandbox, logger, storage, xmlhttpRequester,
            safeWin = new XPCNativeWrapper(unsafeContentWin),
            pref,
            useDist,
            baseUrl,
            sourceUrl,
            emsg;

        sandbox = new Components.utils.Sandbox(safeWin);

        storage = new KanbanPref();

        xmlhttpRequester = new KanbanHttpRequester(
            unsafeContentWin,
            window
        );

        sandbox.window = safeWin;
        sandbox.document = sandbox.window.document;
        sandbox.unsafeWindow = unsafeContentWin;

        // patch missing properties on xpcnw
        sandbox.XPathResult = Components.interfaces.nsIDOMXPathResult;

        // add our own APIs
        sandbox.GM_addStyle = function (css) {
            KanbanLoader.addStyle(sandbox.document, css);
        };
        
        sandbox.GM_setValue = KanbanLoader.hitch(storage, "setValue");
        sandbox.GM_getValue = KanbanLoader.hitch(storage, "getValue");
        sandbox.GM_openInTab = KanbanLoader.hitch(this, "openInTab", unsafeContentWin);
        
        sandbox.GM_xmlhttpRequest = KanbanLoader.hitch(
            xmlhttpRequester,
            "contentStartRequest"
        );
        
        //unsupported
        sandbox.GM_registerMenuCommand = function () {};
        sandbox.GM_log = function () {};
        sandbox.GM_getResourceURL = function () {};
        sandbox.GM_getResourceText = function () {};

        sandbox.prototype = sandbox.window;

        // preferences
        pref = Components.classes["@mozilla.org/preferences-service;1"].
                getService(Components.interfaces.nsIPrefService).
                getBranch("extensions.kanban.");

        // get url pref or default
        baseUrl = (pref.getCharPref("baseUrl").length > 1) ? pref.getCharPref("baseUrl") : "https://rawgit.com/HarryPhillips/Kanban/master/";

        try {
            useDist = pref.getBoolPref("useDist", true);
            sourceUrl = (useDist) ? "dist/kanban.min.js" : "kanban.js";
        } catch (e) {
            // failed for some reason, fallback and set to true
            pref.setBoolPref("useDist", true);
            sourceUrl = "dist/kanban.min.js";
        }

        try {
            //alert(sourceUrl);
            // run userscript
            this.evalInSandbox(
                "(function(){" +
                    "(function () {" +
                    "   var prefUrl = '" + baseUrl + "';" +
                    "   var prefSource = '" + sourceUrl + "';" +
                        script +
                    "}());" +
                    "})()",
                url,
                sandbox
            );
        } catch (e2) {
            emsg = new Error(typeof e2 === "string" ? e2 : e2.message);
            emsg.fileName = script.filename;
            emsg.lineNumber = 0;
            alert(emsg);
        }
    },

    evalInSandbox: function (code, codebase, sandbox) {
        if (Components.utils && Components.utils.Sandbox) {
            // DP beta+
            Components.utils.evalInSandbox(code, sandbox);
        } else if (Components.utils && Components.utils.evalInSandbox) {
            // DP alphas
            Components.utils.evalInSandbox(code, codebase, sandbox);
        } else if (Sandbox) {
            // 1.0.x
            evalInSandbox(code, sandbox, codebase);
        } else {
            throw new Error("Could not create sandbox.");
        }
    },

    openInTab: function (unsafeContentWin, url) {
        var tabBrowser = getBrowser(),
            browser,
            isMyWindow = false,
            loadInBackground,
            sendReferrer,
            referrer = null,
            ios,
            i = 0;
        
        for (i; i < tabBrowser.browsers.length; i += 1) {
            browser = tabBrowser.browsers[i];
            if (browser.contentWindow == unsafeContentWin) {
                isMyWindow = true;
                break;
            }
        }
        
        if (!isMyWindow) {
            return;
        }
        
        loadInBackground = tabBrowser.mPrefs.getBoolPref("browser.tabs.loadInBackground");
        sendReferrer = tabBrowser.mPrefs.getIntPref("network.http.sendRefererHeader");
        
        if (sendReferrer) {
            ios = Components.classes["@mozilla.org/network/io-service;1"]
                                .getService(Components.interfaces.nsIIOService);
            referrer = ios.newURI(content.document.location.href, null, null);
        }
        
        tabBrowser.loadOneTab(url, referrer, null, null, loadInBackground);
    },

    hitch: function (obj, meth) {
        var unsafeTop = new XPCNativeWrapper(unsafeContentWin, "top").top,
            i = 0;

        for (i; i < this.browserWindows.length; i += 1) {
            this.browserWindows[i].openInTab(unsafeTop, url);
        }
    },

    apiLeakCheck: function (allowedCaller) {
        var stack = Components.stack,
            leaked = false;
        
        do {
            if (stack.language === 2) {
                if (stack.filename.substr(0, 6) !== "chrome" &&
                        allowedCaller !== stack.filename) {
                    leaked = true;
                    break;
                }
            }

            stack = stack.caller;
        } while (stack);

        return leaked;
    },

    hitch: function (obj, meth) {
        if (!obj[meth]) {
            throw "method '" + meth + "' does not exist on object '" + obj + "'";
        }

        var hitchCaller = Components.stack.caller.filename,
            staticArgs = Array.prototype.splice.call(arguments, 2, arguments.length);

        return function () {
            if (KanbanLoader.apiLeakCheck(hitchCaller)) {
                return;
            }

            // make a copy of staticArgs (don't modify it because it gets reused for
            // every invocation).
            var args = staticArgs.concat(),
                i;

            // add all the new arguments
            for (i = 0; i < arguments.length; i += 1) {
                args.push(arguments[i]);
            }

            // invoke the original function with the correct this obj and the combined
            // list of static and dynamic arguments.
            return obj[meth].apply(obj, args);
        };
    },

    addStyle: function (doc, css) {
        var head, style;
        head = doc.getElementsByTagName('head')[0];
        if (!head) { return; }
        style = doc.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        head.appendChild(style);
    },

    onLoad: function () {
        var    appcontent = window.document.getElementById("appcontent");
        
        if (appcontent && !appcontent.greased_KanbanLoader) {
            appcontent.greased_KanbanLoader = true;
            appcontent.addEventListener("DOMContentLoaded", KanbanLoader.contentLoad, false);
        }
    },

    onUnLoad: function () {
        //remove now unnecessary listeners
        window.removeEventListener('load', KanbanLoader.onLoad, false);
        window.removeEventListener('unload', KanbanLoader.onUnLoad, false);
        window.document.getElementById("appcontent")
            .removeEventListener("DOMContentLoaded", KanbanLoader.contentLoad, false);
    }
};


function KanbanPref() {
    this.prefMan = new PrefManager();
}

KanbanPref.prototype.setValue = function (name, val) {
    this.prefMan.setValue(name, val);
};

KanbanPref.prototype.getValue = function (name, defVal) {
    return this.prefMan.getValue(name, defVal);
};

// add initialisers
window.addEventListener('load', KanbanLoader.onLoad, false);
window.addEventListener('unload', KanbanLoader.onUnLoad, false);