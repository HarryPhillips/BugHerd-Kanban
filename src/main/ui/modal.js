/*
*   @type javascript
*   @name modal.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

/*
*   TODO
*   + Incorporate a config object to modify how modals react to
*     multiple modals at once.
*     (e.g. Auto-closing a modal on opening
*     of another, moving modals around the screen to show more than
*     one at a time perhaps?)
*
*   + Dynamic modal event handler attachment
*   + Rewrite the modal queueing system (again!) as currently it doesn't
*     scale too well.
*
*
*   NOTES
*   + Open and closing of a single modal should behave as normal.
*
*   + If a modal is opened and another modal is already open, the
*     active modal needs to be pushed into the stack or hidden
*     (depending on configured behaviour) and the requested modal
*     opens as normal.
*
*   + If a stacked modal is clicked, it should be made the active modal
*     and the previously active modal needs to be pushed to stack
*
*   + If a stacked modal's close button is clicked it should be removed
*     from the stack without affecting other modals
*/

define(
    [
        'config',
        'main/components/util',
        'main/components/events',
        'main/components/status',
        'main/components/http',
        'main/ui/node',
        'main/components/viewloader'
    ],
    function (config,
        util, events,
        status, Http,
        Node, ViewLoader) {
        'use strict';
        
        // event logger
        function evtlog(modal, event) {
            util.log(
                "context:gui",
                "debug",
                "Modal '" + modal.viewName + "' " +
                    "event '" + event + "' fired"
            );
        }
        
        // global/shared variables
        var gui,
            vloader = new ViewLoader(),
            ctrl;
        
        /* ModalController Class
        ---------------------------------------------*/
        function ModalController() {
            // list of all modal objects/arrays
            this.list = {};
            
            // modal states
            this.active = null;
            this.stacked = [];
            this.opened = [];
            
            // overlay preservation flag
            this.preserveOverlay = false;
            
            // queue processing
            events.subscribe(
                [
                    "gui/modal/open",
                    "gui/modal/close",
                    "gui/modal/destruct"
                ],
                this.processStack.bind(this)
            );
            
            // create events and process queue
            // on close and destruction
            this.events = [
                "init", "load", "reload", "open", "close",
                "destruct", "confirm", "proceed", "cancel"
            ];
            
            var len = this.events.length,
                i = 0;
            
            // event logging
            for (i; i < len; i += 1) {
                events.subscribe(
                    "gui/modal/" + this.events[i],
                    evtlog
                );
            }
        }
        
        // begin processing the modal queue
        ModalController.prototype.processStack = function processStack(data, event) {
            var active = this.active,
                opened = this.opened,
                stacked = this.stacked,
                modal = data;
            
            util.log("context:gui", "debug", "processing modal stack");
            
            if (stacked.length || opened.length) {
                this.preserveOverlay = true;
            }
            
            // new modal opened
            if (event === "gui/modal/open") {
                // push current modal into stack
                if (active) {
                    this.addToStack(active);
                }
                
                this.addToOpened(modal);
            }
            
            // modal closed - re-open first in stack
            if (event === "gui/modal/close") {
                // if in stack, remove it
                if (this.isStacked(modal)) {
                    this.removeFromStack(modal);
                }
                
                if (stacked.length) {
                    // take out of stack and open
                    modal = stacked[stacked.length - 1];
                    modal.open();
                    this.removeFromStack(modal);
                    
                } else {
                    // reset
                    this.active = null;
                    this.preserveOverlay = false;
                    gui.hideOverlay();
                }
                
                this.removeFromOpened(modal);
            }
        };
        
        // add a new modal instance
        ModalController.prototype.addModal = function (modal) {
            this.list[modal.viewName] = modal;
        };
        
        // remove a modal instance
        ModalController.prototype.removeModal = function (modal) {
            delete this.list[modal.viewName || modal];
        };
        
        // adds a modal to the stack
        ModalController.prototype.addToStack = function (modal) {
            // add stacked class
            util.log(
                "context:gui",
                "debug",
                "Adding modal '" + modal.viewName + "' to stack"
            );
            
            modal.node.addClass("kbs-stacked");
            
            // push to stacked
            this.stacked.push(modal);
        };
        
        // removes a modal from the stack
        ModalController.prototype.removeFromStack = function (modal) {
            var array = this.stacked,
                index = array.indexOf(modal);
            
            // remove from stack
            this.stacked.splice(index, 1);
            
            // remove stacked class
            modal.node.removeClass("kbs-stacked");
            
            util.log(
                "context:gui",
                "debug",
                "Removed modal '" + modal.viewName + "' from stack"
            );
        };
        
        // adds a modals to the queue
        ModalController.prototype.addToQueue = function (modal) {
            this.queued.push(modal);
        };
        
        // removes a modal from the queue
        ModalController.prototype.removeFromQueue = function (modal) {
            var array = this.queued,
                index = array.indexOf(modal.viewName || modal);
            
            this.queued.splice(index, 1);
        };
        
        // adds a modal to the opened modals array
        ModalController.prototype.addToOpened = function (modal) {
            this.opened.push(modal);
        };
        
        // removes a modal from the opened modals array
        ModalController.prototype.removeFromOpened = function (modal) {
            var array = this.opened,
                index = array.indexOf(modal.viewName || modal);
            
            this.opened.splice(index, 1);
        };
        
        // checks if a modal is active
        ModalController.prototype.isActive = function (modal) {
            return this.active === modal;
        };
        
        // checks if a modal is open
        ModalController.prototype.isOpen = function (modal) {
            return this.opened.indexOf(modal) !== -1;
        };
        
        // checks if a modal is queued
        ModalController.prototype.isQueued = function (modal) {
            return this.queued.indexOf(modal) !== -1;
        };
        
        // checks if a modal is stacked
        ModalController.prototype.isStacked = function (modal) {
            return this.stacked.indexOf(modal) !== -1;
        };
        
        // returns a modal by view name
        ModalController.prototype.getModalByName = function (name) {
            return this.list[name];
        };
        
        // checks if a modal exists
        ModalController.prototype.exists = function (name) {
            var exists = false,
                modal = this.getModalByName(name);
            
            // check definition
            if (typeof modal !== "undefined" && modal !== null) {
                exists = true;
            }
            
            return exists;
        };
        
        // checks a behaviour setting
        ModalController.prototype.getBehaviour = function (name) {
            return config.gui.modals.behaviour[name];
        };
        
        // modal controller instance
        ctrl = new ModalController();
        
        /* Modal Class
        ---------------------------------------------*/
        function Modal(view, params) {
            // default params
            params = params || {init: true};
            
            if (typeof params.init === "undefined") {
                params.init = true;
            }
            
            // return current instance
            // if already exists
            if (ctrl.exists(view)) {
                var modal = ctrl.getModalByName(view);
                
                // check if call to init
                if (params.init) {
                    modal.init();
                }
                
                return modal;
            }
            
            // store props
            this.viewName = view;
            this.viewParams = params.viewParams || {};
            this.params = params;
            this.classes = params.classes || "";
            this.inited = false;
            this.loaded = false;
            
            // setup event
            this.createEvents();
            
            // create and hide node
            this.node = new Node("div", "kbs-modal kbs-" + view);
            this.node.addClass(this.classes);
            this.node.hide();
            
            // view element
            this.view = null;
            
            // this should fix the 'this' refs
            // for when our methods are called
            // by external modules
            this.init = this.rInit.bind(this);
            this.open = this.rOpen.bind(this);
            this.close = this.rClose.bind(this);
            this.destroy = this.rDestroy.bind(this);
            
            // set modal event handlers
            this.applyHandlers(params);
            
            // load view and init
            this.load((params.init) ? this.init : function () {});
            
            // add modal to controller
            ctrl.addModal(this);
        }
        
        // setup and create modal events
        Modal.prototype.createEvents = function () {
            var x = 0, y,
                len = ctrl.events.length,
                evtcreate = function () {};
            
            // setup modal specific events
            this.eventName = {};
            for (x; x < len; x += 1) {
                this.eventName[ctrl.events[x]] = "gui/modal/" +
                    this.viewName + x;
            }
            
            // loop through events and create them
            for (y in this.eventName) {
                if (this.eventName.hasOwnProperty(y)) {
                    events.subscribe(this.eventName[y], evtcreate);
                }
            }
        };
        
        // load view into modal
        Modal.prototype.load = function (callback) {
            var self = this,
                params = this.viewParams,
                view;
            
            // return if already loaded
            if (this.loaded) {
                return;
            }
            
            this.loaded = true;
            
            vloader.load(
                "modals/" + this.viewName,
                function (mod) {
                    // get new view
                    view = mod.draw([gui, self, params]);
                    
                    // set view to modal
                    self.view = view;
                    self.viewModule = mod;
                    self.title = view.title;
                    
                    // publish
                    self.trigger("load", self);
                    
                    // run callback
                    if (util.isFunction(callback)) {
                        callback();
                    }
                }
            );
        };
        
        // reload modal a modals content
        Modal.prototype.reload = function (init) {
            var self = this,
                view = this.viewModule,
                render = view.draw([gui, self, self.viewParams]),
                content = this.node.children[2];
            
            content.clear();
            content.addChild(render);
            this.trigger("reload", this);
        };
        
        // attach an event handler to modal
        Modal.prototype.on = function (event, handler) {
            try {
                events.subscribe(
                    this.eventName[event],
                    handler
                );
            } catch (e) {
                util.log(
                    "error",
                    "Modal handler attachment failed with: " +
                        e.message
                );
            }
        };
        
        // remove an event handler from modal
        Modal.prototype.off = function (event, handler) {
            try {
                events.unsubscribe(
                    this.eventName[event],
                    handler
                );
            } catch (e) {
                util.log(
                    "error",
                    "Modal handler removal failed with: " +
                        e.message
                );
            }
        };
        
        // trigger a modal event with data
        Modal.prototype.trigger = function (event, data) {
            events.publish("gui/modal/" + event, data);
            events.publish(this.eventName[event], data);
        };
        
        // hide modal
        Modal.prototype.hide = function () {
            this.node.hide();
        };
        
        // show modal
        Modal.prototype.show = function () {
            this.node.show();
        };
        
        // handler/listener application for modal
        Modal.prototype.applyHandlers = function () {
            var
                // instance ref
                self = this,
            
                // error handler
                err = function (event) {
                    // warning
                    util.log(
                        "warn",
                        "Modal '" + self.viewName + "' " +
                            "event '" + event + "' " +
                            "ran but didn't have a handler!"
                    );
                },
                
                // modal params
                params = this.params;

            // attach modal event handlers
            this.on("confirm", params.confirm || function () {
                err("confirm");
            });
            
            this.on("cancel", params.cancel || function () {
                err("cancel");
            });

            this.on("proceed", params.proceed || function () {
                err("proceed");
            });
        };
        
        // init modal
        Modal.prototype.rInit = function () {
            if (this.inited) {
                // skip build and open
                this.open();
                return this;
            }
            
            // declarations
            var modal = this.node,
                title = modal.createChild(
                    "h2",
                    "kbs-modal-title"
                ),
                close = modal.createChild(
                    "i",
                    "fa fa-times kbs-modal-closed"
                ),
                content = modal.createChild(
                    "p",
                    "kbs-modal-content"
                );
            
            // set content and append to gui
            title.text(this.title);
            close.on("click", this.close);
            content.addChild(this.view);
            gui.addChild(modal);
            
            // flag inited
            this.inited = true;
            
            // publish
            this.trigger("init", this);
            
            // open
            this.open();
        };
        
        // opens the modal
        Modal.prototype.rOpen = function () {
            // if we are already open - return
            if (ctrl.isActive(this)) {
                return;
            }
            
            // make sure we have inited
            if (!this.inited) {
                return this.init();
            }
            
            // show overlay and node
            gui.showOverlay();
            this.node.fadeIn();
            
            // publish
            this.trigger("open", this);
            
            ctrl.active = this;
            
            return this;
        };
        
        // closes the modal
        Modal.prototype.rClose = function () {
            // hide overlay and node
            if (!ctrl.preserveOverlay) {
                gui.hideOverlay();
            }
            
            this.node.hide();
            
            // remove from controller opened modals
            ctrl.removeFromOpened(this);
            
            // publish
            this.trigger("close", this);
        };
        
        // destroys a modal instance
        Modal.prototype.rDestroy = function () {
            // close if open
            if (ctrl.isOpen(this)) {
                this.rClose();
            }
            
            // reset flags
            this.inited = false;
            this.loaded = false;
            
            // remove from ctrl modal array
            ctrl.removeModal(this);
            
            // publish
            this.trigger("destruct", this);
            
            // destroy node
            this.node.destroy();
        };
        
        // set gui instance
        Modal.prototype.setInstance = function (instance) {
            gui = instance;
        };
        
        // get controller instance
        Modal.prototype.getController = function () {
            return ctrl;
        };
        
        return Modal;
    }
);
